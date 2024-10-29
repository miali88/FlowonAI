import Link from "next/link";
import { Youtube, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="container">
      <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
        <div className="md:flex md:justify-between px-8 py-16 sm:pb-16 gap-4">
          <div className="mb-12 flex-col flex gap-4">
            <Link href="/" className="flex gap-2">
              <img alt="Flowon AI Logo" src="/flowonn.png" className="size-8 invert" />
            </Link>
            <p className="max-w-xs"> </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:gap-10 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm tracking-tighter font-medium uppercase">Product</h2>
              <ul className="gap-2 grid list-none">
                <li>
                  <Link
                    href="/"
                    className="cursor-pointer text-muted-foreground hover:text-foreground/80 duration-200 font-[450] text-sm"
                  >
                    Email Collection
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="cursor-pointer text-muted-foreground hover:text-foreground/80 duration-200 font-[450] text-sm"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="cursor-pointer text-muted-foreground hover:text-foreground/80 duration-200 font-[450] text-sm"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm tracking-tighter font-medium uppercase">Community</h2>
              <ul className="gap-2 grid list-none">
                <li>
                  <Link
                    href="/"
                    className="cursor-pointer text-muted-foreground hover:text-foreground/80 duration-200 font-[450] text-sm"
                  >
                    Discord
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="cursor-pointer text-muted-foreground hover:text-foreground/80 duration-200 font-[450] text-sm"
                  >
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link
                    href="mailto:hello@chatcollect.com"
                    className="cursor-pointer text-muted-foreground hover:text-foreground/80 duration-200 font-[450] text-sm"
                  >
                    Email
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm tracking-tighter font-medium uppercase">Legal</h2>
              <ul className="gap-2 grid list-none">
                <li>
                  <Link
                    href="/terms"
                    className="cursor-pointer text-muted-foreground hover:text-foreground/80 duration-200 font-[450] text-sm"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="cursor-pointer text-muted-foreground hover:text-foreground/80 duration-200 font-[450] text-sm"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start sm:flex-row sm:flex sm:items-center sm:justify-between rounded-md border-neutral-700/20 py-4 px-8 gap-2">
          <div className="flex space-x-5 sm:justify-center sm:mt-0">
            <a
              href="#"
              className="text-muted-foreground hover:text-muted-foreground/80 fill-muted-foreground hover:fill-muted-foreground/80"
            >
              <Youtube size={15} />
              <span className="sr-only">Youtube</span>
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-muted-foreground/80 fill-muted-foreground hover:fill-muted-foreground/80"
            >
              <Twitter size={15} />
              <span className="sr-only">Twitter</span>
            </a>
          </div>
          <div className="flex flex-row justify-center text-sm text-muted-foreground gap-1">
            <span>© 2024 </span>
            <Link href="/" className="cursor-pointer">
              Flowon AI
            </Link>
            <span>, All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
