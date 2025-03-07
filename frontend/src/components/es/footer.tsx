'use client';

import Link from "next/link";
import { Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-50 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-lg font-semibold mb-4">Flowon AI</h3>
            <p className="text-gray-600 text-sm">
              Soluciones de IA para la respuesta telefónica de tu negocio
            </p>
            <div className="mt-4">
              <Link href="/" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <Globe className="h-4 w-4 mr-1" />
                English
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/es" className="text-gray-600 hover:text-gray-900 text-sm">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/es/#pricing" className="text-gray-600 hover:text-gray-900 text-sm">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/es/#contact" className="text-gray-600 hover:text-gray-900 text-sm">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">
                  Términos de servicio
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 text-sm text-center">
            &copy; {new Date().getFullYear()} Flowon AI. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
} 