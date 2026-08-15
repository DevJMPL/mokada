import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg1 from "../../../assets/configuration/01.jpg";
import bg2 from "../../../assets/configuration/02.jpg";
import bg3 from "../../../assets/configuration/03.jpg";
import bg4 from "../../../assets/configuration/04.jpg";
import {
  Ruler,
  BadgeDollarSign,
  Settings as SettingsIcon,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../auth/context/useAuth";

export const ConfigurationPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [hoveredModule, setHoveredModule] = useState<any>(null);
  const [isExiting, setIsExiting] = useState(false);

  const handleNavigate = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      navigate(path);
    }, 400);
  };

  const configModules = [
    {
      title: "Unidades de Medida",
      description: "Gestión de unidades para inventario y productos.",
      icon: Ruler,
      path: "/config/units",
      color: "text-blue-600",
      bgImage: bg1,
    },
    {
      title: "Listas de Precios",
      description:
        "Configuración de niveles de precios y descuentos especiales.",
      icon: BadgeDollarSign,
      path: "/config/price-lists",
      color: "text-emerald-600",
      bgImage: bg2,
    },
    {
      title: "Atributos Dinámicos",
      description:
        "Definición de características configurables para productos.",
      icon: SettingsIcon,
      path: "/config/attributes",
      color: "text-purple-600",
      bgImage: bg3,
    },
  ];

  if (isAdmin) {
    configModules.push({
      title: "Usuarios y Permisos",
      description: "Gestión de accesos y roles del sistema.",
      icon: ShieldCheck,
      path: "/admin/users",
      color: "text-orange-600",
      bgImage: bg4,
    });
  }

  return (
    <div className="relative">
      {/* Dynamic Backgrounds */}
      <div className={`fixed inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-500 ease-in-out ${isExiting ? "opacity-0" : "opacity-100"}`}>
        {configModules.map((module) => (
          <div
            key={`bg-${module.path}`}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out ${
              hoveredModule?.path === module.path
                ? "opacity-30 scale-105"
                : "opacity-0 scale-100"
            }`}
            style={{
              backgroundImage: `url(${module.bgImage})`,
              filter: "blur(2px)",
              transformOrigin: "center",
            }}
          />
        ))}
        {/* Blending Overlay to soften the background */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
      </div>

      <div 
        className={`relative z-10 max-w-5xl mx-auto min-h-[calc(100vh-12rem)] flex flex-col justify-center px-4 py-12 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isExiting ? "opacity-0 scale-[0.97]" : "opacity-100 scale-100"}`}
      >
        {/* Dynamic Hero Area */}
        <div className="mb-16 min-h-[120px] flex flex-col justify-end">
          <div
            className="transition-all duration-500 ease-out transform origin-left"
            style={{
              opacity: hoveredModule ? 1 : 0.9,
              transform: hoveredModule ? "translateY(0)" : "translateY(4px)",
            }}
          >
            <h2 className="text-[40px] md:text-[48px] font-bold tracking-tight text-[#1D1D1F] leading-tight transition-colors duration-300">
              {hoveredModule
                ? hoveredModule.title
                : "Configuración del Sistema"}
            </h2>
            <p className="text-[17px] md:text-[19px] text-[#86868B] mt-2 transition-all duration-300">
              {hoveredModule
                ? hoveredModule.description
                : "Administra los catálogos base, preferencias y seguridad de tu cuenta."}
            </p>
          </div>
        </div>

        {/* Tiles Row */}
        <div className="flex flex-wrap gap-6 md:gap-8">
          {configModules.map((module) => (
            <a
              href={module.path}
              onClick={(e) => handleNavigate(e, module.path)}
              onMouseEnter={() => setHoveredModule(module)}
              onMouseLeave={() => setHoveredModule(null)}
              className="group relative w-32 h-32 md:w-44 md:h-44 rounded-3xl flex items-center justify-center transition-all duration-300 ease-out hover:bg-black/5 hover:scale-110 hover:-translate-y-2 z-10 hover:z-20 cursor-pointer"
            >
              <div
                className={`relative flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${module.color}`}
              >
                {/* SVG Icon with larger size and sharp stroke */}
                <module.icon className="w-12 h-12 md:w-16 md:h-16 stroke-[1.5]" />
              </div>

              {/* Playful indicator dot (Optional subtle touch) */}
              <div
                className={`absolute bottom-6 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 ${module.color.replace("text-", "bg-")}`}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
