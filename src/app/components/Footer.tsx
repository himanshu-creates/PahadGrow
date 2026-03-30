import logo from "../../assets/placeholder.png";
import { Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#052e1c] to-[#031e13] text-white pt-12">

      {/* Newsletter */}
      <div className="container mx-auto px-6 mb-12">
        <div className="bg-[#0b3d2a] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div>
            <h3 className="text-xl font-semibold">
              Stay Updated with PahadGrow
            </h3>
            <p className="text-gray-300 text-sm">
              Get the latest updates on crops, farming tips, and community stories
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded-lg bg-[#0f4a33] border border-green-700 outline-none w-full md:w-[300px]"
            />
            <button className="bg-green-600 px-5 py-2 rounded-lg">
              Subscribe
            </button>
          </div>

        </div>
      </div>


      {/* Main Footer */}
      <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8 pb-8">

        {/* Logo */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img 
              src={logo}
              className="h-8 w-auto object-contain"
            />

            <div>
              <h2 className="font-bold text-lg">
                PahadGrow
              </h2>
              <p className="text-xs text-gray-400">
                CULTIVATING GROWTH
              </p>
            </div>
          </div>

          <p className="text-gray-300 text-sm">
            Cultivating Growth from the Hills. Empowering Uttarakhand villages 
            through technology and connecting farmers to opportunities.
          </p>

          {/* Social */}
          <div className="flex gap-3 mt-4">
            <Facebook />
            <Instagram />
            <Youtube />
            <MessageCircle />
          </div>
        </div>


        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <div className="flex flex-col gap-2 text-gray-300 text-sm">
            <a>Marketplace</a>
            <a>Knowledge</a>
            <a>Land Rental</a>
            <a>Community</a>
          </div>
        </div>


        {/* Support */}
        <div>
          <h3 className="font-semibold mb-3">Support</h3>
          <div className="flex flex-col gap-2 text-gray-300 text-sm">
            <a>Help Center</a>
            <a>Contact Us</a>
            <a>FAQs</a>
            <a>Pricing</a>
          </div>
        </div>


        {/* Legal */}
        <div>
          <h3 className="font-semibold mb-3">Legal</h3>
          <div className="flex flex-col gap-2 text-gray-300 text-sm">
            <a>Privacy Policy</a>
            <a>Terms of Service</a>
            <a>Refund Policy</a>
            <a>Cookie Policy</a>
          </div>
        </div>

      </div>


      {/* Bottom Line */}
      <div className="border-t border-green-800">
        <div className="container mx-auto px-6 py-4 flex justify-center text-gray-400 text-sm">
          
          <div>
            © {new Date().getFullYear()} PahadGrow. All rights reserved.
          
          </div>

        
        </div>
      </div>

    </footer>
  );
}