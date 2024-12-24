import { CardSpotlight } from "@/components/ui/card-spotlight";
import { SiWebflow, SiShopify, SiWix, SiWordpress, SiBigcommerce } from "react-icons/si";
import softrIcon from '/public/icons/softr.png';
import bubbleIcon from '/public/icons/bubble.png';
import squarespaceIcon from '/public/icons/squarespace.png';
import unicornIcon from '/public/icons/unicornplatform.svg';
import retoolIcon from '/public/icons/retool.svg';
import Image from 'next/image';

export function IntegrationsSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-4xl mx-auto text-center">
        {/* <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-white">
          Seamless Integrations
        </h2> */}
        <p className="text-xl text-neutral-200 mb-12">
          We support a wide range of web platforms and CMS systems
        </p>

        <CardSpotlight className="p-8">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-8">
            {platforms.map((platform) => (
              <div key={platform.name} className="flex flex-col items-center">
                <div className="bg-neutral-800/50 p-4 rounded-xl w-20 h-20 flex items-center justify-center mb-3">
                  <platform.icon className="w-12 h-12 text-white" />
                </div>
                <span className="text-sm text-neutral-300">{platform.name}</span>
              </div>
            ))}
          </div>
        </CardSpotlight>
      </div>
    </section>
  );
}

const platforms = [
  { name: 'Webflow', icon: SiWebflow },
  { name: 'Softr', icon: () => <Image src={softrIcon} alt="Softr" width={48} height={48} className="brightness-0 invert" /> },
  { name: 'BigCommerce', icon: SiBigcommerce },
  { name: 'Shopify', icon: SiShopify },
  { name: 'Wix', icon: SiWix },
  { name: 'WordPress', icon: SiWordpress },
  { name: 'Bubble', icon: () => <Image src={bubbleIcon} alt="Bubble" width={48} height={48} className="brightness-0 invert" /> },
  { name: 'Squarespace', icon: () => <Image src={squarespaceIcon} alt="Squarespace" width={48} height={48} /> },
  { name: 'Unicorn Platform', icon: () => <Image src={unicornIcon} alt="Unicorn Platform" width={48} height={48} className="brightness-0 invert" /> },
  { name: 'Retool', icon: () => <Image src={retoolIcon} alt="Retool" width={48} height={48} className="brightness-0 invert" /> },

]; 