import { Facebook, Instagram, Linkedin, Mail, Phone, Youtube } from "lucide-react";

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/people/XCode-Web-Solutions-LLP/100090578111884/", icon: Facebook },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/xcode-web-solutions", icon: Linkedin },
  { label: "Instagram", href: "https://www.instagram.com/xcode_web_solutions/", icon: Instagram },
  { label: "YouTube", href: "https://www.youtube.com/@xcode-web-solutions", icon: Youtube }
];

export function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 text-sm text-slate-600 backdrop-blur lg:left-[260px]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <a href="https://xcodewebsolutions.com/" target="_blank" rel="noreferrer" className="font-bold text-ink no-underline hover:text-primary">
            Xcode Web Solutions LLP
          </a>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <a href="mailto:sales@xcodewebsolutions.com" className="inline-flex items-center gap-1.5 text-slate-600 no-underline hover:text-primary">
              <Mail className="h-3.5 w-3.5" />
              sales@xcodewebsolutions.com
            </a>
            <a href="tel:+919023035541" className="inline-flex items-center gap-1.5 text-slate-600 no-underline hover:text-primary">
              <Phone className="h-3.5 w-3.5" />
              +91 90230 35541
            </a>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer" title={link.label} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-slate-500 hover:bg-[#eef6ff] hover:text-primary">
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      </div>
      <div className="mt-2 border-t border-line pt-2 text-xs text-slate-500">
        Design and Developed By: Xcode Web Solutions LLP. Copy rights reserved - 2025-26.
      </div>
    </footer>
  );
}
