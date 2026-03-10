import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface GitUploadPayload {
  token?: string;
  branch?: string;
  provider?: string;
  repo_url?: string;
}

interface ParsedRepo {
  host: string;
  origin: string;
  ownerOrNamespace: string;
  repo: string;
  fullPath: string;
}

function parseRepoUrl(repoUrl: string): ParsedRepo | null {
  try {
    const url = new URL(repoUrl.trim());
    const cleanedPath = url.pathname.replace(/^\/+|\/+$/g, "");
    if (!cleanedPath) {
      return null;
    }

    const pathWithoutGit = cleanedPath.replace(/\.git$/i, "");
    const parts = pathWithoutGit.split("/").filter(Boolean);

    if (parts.length < 2) {
      return null;
    }

    const repo = parts[parts.length - 1];
    const namespaceParts = parts.slice(0, -1);

    return {
      host: url.host.toLowerCase(),
      origin: url.origin,
      ownerOrNamespace: namespaceParts[0],
      repo,
      fullPath: `${namespaceParts.join("/")}/${repo}`,
    };
  } catch {
    return null;
  }
}

async function downloadArchive(
  payload: GitUploadPayload,
  parsedRepo: ParsedRepo,
  provider: string
): Promise<Response> {
  const branch = (payload.branch || "main").trim() || "main";

  if (provider === "github") {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "sastify-proxy",
    };

    if (payload.token) {
      headers.Authorization = `token ${payload.token}`;
    }

    const archiveUrl = `https://api.github.com/repos/${parsedRepo.ownerOrNamespace}/${parsedRepo.repo}/zipball/${encodeURIComponent(branch)}`;
    return fetch(archiveUrl, {
      method: "GET",
      headers,
      redirect: "follow",
      cache: "no-store",
    });
  }

  if (provider === "gitlab") {
    const headers: Record<string, string> = {
      "User-Agent": "sastify-proxy",
    };

    if (payload.token) {
      headers["PRIVATE-TOKEN"] = payload.token;
      headers.Authorization = `Bearer ${payload.token}`;
    }

    const projectId = encodeURIComponent(parsedRepo.fullPath);
    const archiveUrl = `${parsedRepo.origin}/api/v4/projects/${projectId}/repository/archive.zip?sha=${encodeURIComponent(branch)}`;
    return fetch(archiveUrl, {
      method: "GET",
      headers,
      redirect: "follow",
      cache: "no-store",
    });
  }

  if (provider === "bitbucket") {
    const headers: Record<string, string> = {
      "User-Agent": "sastify-proxy",
    };

    if (payload.token) {
      headers.Authorization = `Bearer ${payload.token}`;
    }

    const archiveUrl = `${parsedRepo.origin}/${parsedRepo.ownerOrNamespace}/${parsedRepo.repo}/get/${encodeURIComponent(branch)}.zip`;
    return fetch(archiveUrl, {
      method: "GET",
      headers,
      redirect: "follow",
      cache: "no-store",
    });
  }

  throw new Error("Unsupported provider");
}

async function passThroughGitUpload(authHeader: string, payload: GitUploadPayload) {
  const upstreamResponse = await fetch(`${API_BASE_URL}/project/git/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const responseText = await upstreamResponse.text();

  try {
    const json = JSON.parse(responseText);
    return NextResponse.json(json, { status: upstreamResponse.status });
  } catch {
    return NextResponse.json(
      {
        "status-code": upstreamResponse.status,
        success: upstreamResponse.ok,
        message: responseText || "Upstream error",
      },
      { status: upstreamResponse.status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        {
          "status-code": 401,
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const payload = (await request.json()) as GitUploadPayload;
    const provider = (payload.provider || "").toLowerCase();

    const parsedRepo = parseRepoUrl(payload.repo_url || "");

    if (!parsedRepo) {
      return NextResponse.json(
        {
          "status-code": 400,
          success: false,
          message: "Enter a valid repository URL.",
        },
        { status: 400 }
      );
    }

    // Keep existing backend behavior only for unsupported providers.
    if (!["github", "gitlab", "bitbucket"].includes(provider)) {
      return passThroughGitUpload(authHeader, payload);
    }

    const archiveResponse = await downloadArchive(payload, parsedRepo, provider);

    if (!archiveResponse.ok) {
      const errorBody = await archiveResponse.text();
      return NextResponse.json(
        {
          "status-code": archiveResponse.status,
          success: false,
          message: errorBody || "Failed to download repository archive.",
        },
        { status: archiveResponse.status }
      );
    }

    const archiveBlob = await archiveResponse.blob();
    const branch = (payload.branch || "main").trim() || "main";
    const formData = new FormData();
    formData.append("project", archiveBlob, `${parsedRepo.repo}-${branch}.zip`);

    const uploadResponse = await fetch(`${API_BASE_URL}/project/upload`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
      cache: "no-store",
    });

    const responseText = await uploadResponse.text();

    try {
      const json = JSON.parse(responseText);
      return NextResponse.json(json, { status: uploadResponse.status });
    } catch {
      return NextResponse.json(
        {
          "status-code": uploadResponse.status,
          success: uploadResponse.ok,
          message: responseText || "Upstream error",
        },
        { status: uploadResponse.status }
      );
    }
  } catch {
    return NextResponse.json(
      {
        "status-code": 500,
        success: false,
        message: "Failed to proxy git import request",
      },
      { status: 500 }
    );
  }
}
