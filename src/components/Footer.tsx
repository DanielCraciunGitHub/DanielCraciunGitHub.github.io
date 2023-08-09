import { siteConfig } from "@/config/site"
import { DarkModeButton } from "@/components/DarkModeButton"
import FooterItem from "@/components/FooterItem"

import { NavItem } from "./NavItem"

const Footer = () => {
  return (
    <footer>
      <div className="p-4 py-6">
        <hr className="my-4 border-gray-300 dark:border-gray-700" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex w-full flex-col space-y-3">
            <div className="flex justify-between">
              <div className="space-x-3">
                {siteConfig.footer.map((footerItem) => (
                  <FooterItem
                    key={footerItem.href}
                    name={footerItem.name}
                    href={footerItem.href}
                    icon={footerItem.icon}
                  />
                ))}
              </div>
              <DarkModeButton />
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 rounded border border-gray-200 dark:border-gray-700 sm:flex-row sm:space-y-0">
              {siteConfig.mainNav.slice(1).map((item) => (
                <NavItem key={item.href} page={item.href} text={item.name} />
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              © 2023 (EMM) EduMentorMe™. All Rights Reserved
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
