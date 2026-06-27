import React, { useMemo } from "react";

import Twitter from "../assets/images/social-media/twitter.svg";
import Fb from "../assets/images/social-media/fb.svg";
import Linkedin from "../assets/images/social-media/linkedin.svg";
import Insta from "../assets/images/social-media/instagram.svg";
import Discord from "../assets/images/social-media/discord.svg";
import Telegram from "../assets/images/social-media/telegram.svg";

const SocialMedia = () => {
  const socialMediaIcons = useMemo(() => {
    return [
      {
        icon: Twitter,
        type: "twitter",
        link: "https://twitter.com/LuMaNaGi",
      },
      {
        icon: Fb,
        type: "facebook",
        link: "https://www.facebook.com/Lumanagiswap",
      },
      {
        icon: Linkedin,
        type: "linkedin",
        link: "https://www.linkedin.com/company/lumanagi/",
      },
      {
        icon: Insta,
        type: "instagram",
        link: "https://www.instagram.com/lumanagi.dex/",
      },
      {
        icon: Discord,
        type: "discord",
        link: "https://discord.gg/KFzZbB6F",
      },
      {
        icon: Telegram,
        type: "telegram",
        link: "https://t.me/+bMAZj4p_PVM2NGM0",
      },
    ];
  }, []);

  return (
    <>
      <div className="flex my-4 sm:my-6 md:my-8 space-x-4 sm:space-x-6 md:space-x-8 justify-center sm:justify-start">
        {socialMediaIcons.map((data, index) => (
          <React.Fragment key={`social-media-icon-item-${index}`}>
            <a href={data.link} className="hover:opacity-80 transition-opacity">
              <img 
                src={data.icon} 
                alt={data.type} 
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
              />
            </a>
          </React.Fragment>
        ))}
      </div>
    </>
  );
};

// const Company = () => {
//   const pages = useMemo(() => {
//     return [
//       {
//         label: "About us",
//         path: "/about-us",
//       },
//       {
//         label: "Blog",
//         path: "/blog",
//       },
//       {
//         label: "Press",
//         path: "/press",
//       },
//       {
//         label: "Careers",
//         path: "/careers",
//       },
//     ];
//   }, []);

//   const handleRoute = (path: string) => {
//     console.log("Routing to : ", path);
//   };

//   return (
//     <>
//       <div className="flex flex-col space-y-2 text-xl font-medium">
//         <div className="mb-2 text-gray-600">Company</div>
//         {pages.map((page, index) => (
//           <React.Fragment key={`company-item-${index}`}>
//             <div className="text-white" onClick={() => handleRoute(page.path)}>
//               {page.label}
//             </div>
//           </React.Fragment>
//         ))}
//       </div>
//     </>
//   );
// };

const Papers = () => {
  const pages = useMemo(() => {
    return [
      {
        label: "LitePaper",
        path: "",
        link: "https://lumanagi.com/wp-content/uploads/2023/01/Lumanagi-Lite-Paper-v3-1.pdf",
      },
      {
        label: "Pitch Deck",
        path: "",
      },
      {
        label: "Privacy Policy",
        path: "/privacy-policy",
      },
      {
        label: "Terms & Conditions",
        path: "/terms-conditions",
      },
      {
        label: "Cookies",
        path: "/cookies",
      },
    ];
  }, []);

  const handleRoute = (path: string) => {
    console.log("Routing to : ", path);
  };

  return (
    <>
      <div className="flex flex-col space-y-1 sm:space-y-2 text-base sm:text-lg md:text-xl font-medium">
        <div className="mb-1 sm:mb-2 text-gray-600 text-sm sm:text-base md:text-lg">Papers</div>
        {pages.map((page, index) => (
          <React.Fragment key={`company-item-${index}`}>
            {page.link ? (
              <a 
                className="text-white hover:opacity-80 transition-opacity text-sm sm:text-base md:text-lg" 
                href={page.link}
                target={page.link.startsWith('http') ? '_blank' : '_self'}
                rel={page.link.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {page.label}
              </a>
            ) : (
              <div
                className="text-white hover:opacity-80 transition-opacity cursor-pointer text-sm sm:text-base md:text-lg"
                onClick={() => handleRoute(page.path)}
              >
                {page.label}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
};

export function Footer() {
  return (
    <div className="relative bottom-0 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start px-4 sm:px-8 md:px-12 lg:px-20 mt-20 sm:mt-32 md:mt-40 gap-8 sm:gap-0">
        <div className="flex flex-col justify-center items-center sm:items-start w-full sm:w-auto">
          <a className="flex items-center gap-3 justify-center sm:justify-start" href="/">
            <img src="/logoNovaFy.png" alt="Novafy" className="h-10 w-auto" />
            <span className="text-white font-bold text-xl tracking-wide">Novafy</span>
          </a>
          <SocialMedia />
        </div>
        <div className="flex justify-center sm:justify-end w-full sm:w-auto">
          <Papers />
        </div>
      </div>
      <hr className="mx-4 sm:mx-8 md:mx-12 lg:mx-20 mt-6 sm:mt-8 mb-4 text-white border-white/20"></hr>
      <div className="flex w-full mb-6 sm:mb-8 md:mb-10 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="flex flex-col sm:flex-row justify-center items-center w-full gap-2 sm:gap-0 text-sm sm:text-base md:text-lg text-white">
          <a
            className="opacity-50 hover:opacity-75 transition-opacity"
            href="/"
          >
            © Novafy
          </a>
          <div className="flex items-center ml-0 sm:ml-2 gap-1 sm:gap-2">
            <span className="opacity-50 cursor-pointer hover:opacity-75 transition-opacity">HU</span>
            <span className="cursor-pointer hover:opacity-75 transition-opacity">EN</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
