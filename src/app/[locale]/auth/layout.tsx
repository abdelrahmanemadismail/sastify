import { ReactNode } from "react";
import { LogoText } from "@/components/logo/logo-text";
import { ModeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full min-h-screen bg-[#E8E9EE] dark:bg-[#0B122a] overflow-hidden transition-colors">
      {/* Header with Logo and Controls */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 lg:px-12 py-6">
        <LogoText className="h-10" />
        <div className="flex items-center gap-3">
          <ModeToggle />
          <LanguageSwitcher />
        </div>
      </header>

      {/* Decorative dots pattern - left side */}
      <div className="absolute left-0 top-40 w-48 h-80 opacity-30 pointer-events-none">
        <svg viewBox="0 0 225 360" className="w-full h-full" fill="none">
          {/* Grid of dots */}
          {[...Array(11)].map((_, row) =>
            [...Array(12)].map((_, col) => (
              <circle
                key={`dot-${row}-${col}`}
                cx={col * 19.85}
                cy={row * 35.38}
                r="2.5"
                fill="#CD202F"
              />
            ))
          )}
        </svg>
      </div>

      {/* Chart visualization with wavy line - bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[300px] lg:h-[500px] opacity-30 pointer-events-none">
        <svg viewBox="0 0 1920 634" className="w-full h-full" preserveAspectRatio="xMidYMax slice" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g opacity="0.3">
            <path d="M1931.11 1C1904.19 1 1904.19 80.7577 1877.27 80.7577C1850.34 80.7577 1851.47 47.288 1823.42 47.288C1795.37 47.288 1797.62 145.561 1769.57 145.561C1741.53 145.561 1746.01 106.109 1715.73 106.109C1685.44 106.109 1693.29 201.961 1661.88 201.961C1630.47 201.961 1634.96 60.8183 1608.03 60.8183C1581.11 60.8183 1583.35 163.791 1554.18 163.791C1525.02 163.791 1529.5 135.591 1500.34 135.591C1471.17 135.591 1475.66 206.091 1446.49 206.091C1417.32 206.091 1420.69 240.273 1392.64 240.273C1364.6 240.273 1366.84 163.364 1338.8 163.364C1310.75 163.364 1314.12 244.261 1284.95 244.261C1255.78 244.261 1262.51 195.409 1231.1 195.409C1199.69 195.409 1205.3 141.003 1177.25 141.003C1149.21 141.003 1152.57 265.197 1123.41 265.197C1094.24 265.197 1098.73 87.879 1069.56 87.879C1040.39 87.879 1043.76 193.843 1015.71 193.843C987.668 193.843 993.277 257.222 961.866 257.222C930.455 257.222 938.308 218.767 908.019 218.767C877.73 218.767 885.583 297.1 854.172 297.1C822.761 297.1 830.614 266.907 800.325 266.907C770.036 266.907 775.645 221.188 746.478 221.188C717.31 221.188 721.798 385.404 692.63 385.404C663.463 385.404 670.194 345.24 638.783 345.24C607.372 345.24 611.86 408.049 584.936 408.049C558.013 408.049 561.378 363.185 531.089 363.185C500.8 363.185 505.287 492.792 477.242 492.792C449.197 492.792 454.806 453.767 423.395 453.767C391.984 453.767 399.837 425.425 369.548 425.425C339.259 425.425 344.868 512.304 315.7 512.304C286.533 512.304 293.264 530.534 261.853 530.534C230.443 530.534 239.417 482.537 208.006 482.537C176.596 482.537 181.083 456.901 154.159 456.901C127.236 456.901 127.236 540.219 100.312 540.219C73.3885 540.219 -5.88643 650.157 -34.6797 618.746" stroke="#CD202F" strokeWidth="2"/>
            <path d="M88.2879 535.561L77.8757 553.307L28.142 605.658L-32.0621 629.216L-142 686.803H1931.11V1L1918.04 8.82285L1894.52 68.798L1881.45 79.2285L1857.92 74.0132L1831.78 47.9371L1816.1 50.5447L1792.58 107.912L1776.89 144.419H1755.98L1735.07 110.52L1721.05 107.912H1706.32L1677.56 191.356L1669.72 196.571L1656.65 201.786L1643.58 183.533L1622.67 74.0132L1609.6 60.9752L1596.53 66.1904L1570.39 154.849L1554.71 165.28L1525.95 149.634L1510.27 136.596H1489.36L1468.45 186.141L1455.38 204.394L1429.24 209.609L1408.33 235.685L1395.26 240.901L1382.19 235.685L1353.43 167.887L1329.91 162.672L1301.16 233.078L1290.7 243.508L1275.02 240.901L1243.65 196.571L1220.12 193.964L1201.83 165.28L1188.76 144.419L1175.69 139.204L1165.23 147.026L1139.09 246.116L1131.25 261.762L1120.79 264.369L1107.72 238.293L1081.58 100.089L1073.74 89.6589H1068.51L1055.44 97.4818L1034.53 175.71L1024.08 191.356L1003.17 196.571L977.027 248.724L969.185 256.546H956.115L940.432 246.116L924.748 222.647L911.678 217.432L890.767 230.47L877.697 274.8L864.627 290.445L851.558 295.661L828.032 282.623L809.735 266.977L791.437 264.369L783.595 256.546L762.684 227.863L749.614 220.04L736.544 227.863L715.633 339.99L699.949 381.712H684.266L660.74 353.028L647.671 347.813L626.759 345.205L608.462 384.32L590.164 405.18L579.708 407.788L558.797 376.497L535.271 363.459L519.588 368.674L488.22 486.017L475.151 491.232L454.239 470.371L425.486 449.51H412.416L396.733 431.257L373.207 423.434L357.524 431.257L336.612 496.447L315.701 509.485L302.631 514.7L284.333 522.523L255.58 527.738L239.896 514.7L221.599 486.017L198.073 480.801L177.162 465.156L158.864 454.725L148.409 457.333L137.953 478.194L117.041 527.738L103.972 538.169L88.2879 535.561Z" fill="url(#paint0_linear_1_2482)"/>
            <path d="M-47.1116 588.336C-31.762 588.336 -19.3186 600.779 -19.3186 616.129C-19.3186 631.478 -31.762 643.921 -47.1116 643.922C-62.4613 643.922 -74.9055 631.478 -74.9055 616.129C-74.9055 600.779 -62.4614 588.336 -47.1116 588.336ZM159.021 436.516C174.371 436.516 186.814 448.96 186.814 464.309C186.814 479.659 174.371 492.103 159.021 492.103C143.671 492.103 131.228 479.659 131.228 464.309C131.228 448.96 143.672 436.516 159.021 436.516Z" fill="#CD202F" stroke="#001219" strokeWidth="2"/>
            <circle cx="368.426" cy="432.899" r="27.7933" fill="#CD202F" stroke="#001219" strokeWidth="2"/>
            <circle cx="530.715" cy="364.842" r="27.7933" fill="#CD202F" stroke="#001219" strokeWidth="2"/>
            <circle cx="745.356" cy="218.258" r="27.7933" fill="#CD202F" stroke="#001219" strokeWidth="2"/>
            <circle cx="907.646" cy="228.728" r="27.7933" fill="#CD202F" stroke="#001219" strokeWidth="2"/>
            <circle cx="1069.93" cy="97.8501" r="27.7933" fill="#CD202F" stroke="#001219" strokeWidth="2"/>
            <circle cx="1185.11" cy="139.731" r="27.7933" fill="#CD202F" stroke="#001219" strokeWidth="2"/>
            <circle cx="1394.51" cy="228.728" r="27.7933" fill="#CD202F" stroke="#001219" strokeWidth="2"/>
            <circle cx="1603.92" cy="66.4392" r="27.7933" fill="#CD202F" stroke="#001219" strokeWidth="2"/>
            <circle cx="1818.56" cy="50.7339" r="27.7933" fill="#CD202F" stroke="#001219" strokeWidth="2"/>
            <circle cx="1661.51" cy="192.083" r="27.7933" fill="#CD202F" stroke="#001219" strokeWidth="2"/>
            <circle cx="698.24" cy="375.312" r="27.7933" fill="#CD202F" stroke="#001219" strokeWidth="2"/>
          </g>
          <defs>
            <linearGradient id="paint0_linear_1_2482" x1="988.79" y1="1" x2="988.79" y2="686.803" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00D4FF" stopOpacity="0.12"/>
              <stop offset="1" stopColor="white" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main content area */}
      <div className="relative z-10 w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
        {/* Left side - Hero content */}
        <div className="hidden lg:flex flex-col justify-center px-12 pt-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-poppins mb-12 leading-tight">
              <span className="bg-gradient-to-r from-[#29214D] via-[#1D2250] to-[#900B09] bg-clip-text text-transparent dark:from-[#CD202F] dark:via-[#E8495F] dark:to-[#900B09]">
                Make Your Code
                <br />
                Secure with
                <br />
                SASTify
              </span>
            </h1>

            {/* Features List */}
            <div className="space-y-6">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                  ),
                  title: "Comprehensive Vulnerability Detection",
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 5.08V3h-2v2.08C7.61 5.57 5 8.47 5 12v7l-2 2v1h18v-1l-2-2v-7c0-3.53-2.61-6.43-6-6.92zM12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" />
                    </svg>
                  ),
                  title: "Fast and Accurate Scanning",
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                    </svg>
                  ),
                  title: "Detailed Reporting and Insights",
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                  ),
                  title: "User-Friendly Dashboard",
                },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-11 h-11 bg-[#0A0C1C] dark:bg-white/10 border border-white dark:border-white/20 rounded-2xl flex items-center justify-center text-white dark:text-white transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-[#0B0E1E] dark:text-white font-poppins transition-colors">
                    {feature.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex flex-col items-center justify-center px-4 lg:px-8 py-20 lg:py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
