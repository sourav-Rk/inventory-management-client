import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBox,
  FaUsers,
  FaShoppingCart,
  FaChartBar,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const navigation = [
    { name: "Dashboard", href: "/", icon: FaHome },
    { name: "Inventory", href: "/inventory", icon: FaBox },
    { 
      name: "Customers", 
      icon: FaUsers,
      submenu: [
        { name: "Customers List", href: "/customers" },
        { name: "Customer Ledger", href: "/customers/ledger" },
      ]
    },
    { name: "Sales", href: "/sales", icon: FaShoppingCart },
    { 
      name: "Reports", 
      icon: FaChartBar,
      submenu: [
        { name: "Sales Report", href: "/reports/sales" },
        { name: "Items Report", href: "/reports/items" },
      ]
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const isActiveMenu = (item: any) => {
    if (item.href) {
      return location.pathname === item.href;
    }
    if (item.submenu) {
      return item.submenu.some((sub: any) => location.pathname === sub.href);
    }
    return false;
  };

  return (
    <div className="h-screen bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 flex overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r-2 border-amber-200 shadow-lg">
        <div className="h-16 flex items-center justify-center px-6 border-b-2 border-amber-200 bg-linear-to-r from-amber-100 to-orange-100 shrink-0">
          <h1 className="text-xl font-bold text-gray-800">
            Inventory<span className="text-amber-600">App</span>
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => (
              <li key={item.name}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                        isActiveMenu(item)
                          ? "bg-linear-to-r from-amber-100 to-orange-100 text-amber-700"
                          : "text-gray-600 hover:bg-amber-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon
                          className={`mr-3 h-5 w-5 ${
                            isActiveMenu(item)
                              ? "text-amber-600"
                              : "text-gray-400"
                          }`}
                        />
                        {item.name}
                      </div>
                      {openMenus[item.name] ? (
                        <FaChevronDown className="h-4 w-4" />
                      ) : (
                        <FaChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {openMenus[item.name] && (
                      <ul className="mt-1 ml-6 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              to={subItem.href}
                              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                                location.pathname === subItem.href
                                  ? "bg-amber-500 text-white"
                                  : "text-gray-600 hover:bg-amber-50 hover:text-gray-900"
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 group ${
                      location.pathname === item.href
                        ? "bg-linear-to-r from-amber-100 to-orange-100 text-amber-700"
                        : "text-gray-600 hover:bg-amber-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        location.pathname === item.href
                          ? "text-amber-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t-2 border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 shrink-0">
          <div className="flex items-center w-full px-4 py-3 transition-colors duration-150 hover:bg-white/50 rounded-lg">
            <FaUserCircle className="h-8 w-8 text-amber-600 mr-3" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {user?.role || "Staff"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 ml-2 transition-colors"
              title="Logout"
            >
              <FaSignOutAlt className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b-2 border-amber-200 shadow-sm shrink-0">
          <h1 className="text-lg font-bold text-gray-800">
            Inventory<span className="text-amber-600">App</span>
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -mr-2 text-gray-500 hover:text-amber-600 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
          >
            <span className="sr-only">Open menu</span>
            {isMobileMenuOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <FaTimes className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="shrink-0 flex items-center px-4 mb-4">
                  <h1 className="text-xl font-bold text-gray-800">
                    Inventory<span className="text-amber-600">App</span>
                  </h1>
                </div>
                <nav className="px-2 space-y-1">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      {item.submenu ? (
                        <div>
                          <button
                            onClick={() => toggleMenu(item.name)}
                            className={`w-full group flex items-center justify-between px-2 py-2 text-base font-medium rounded-md ${
                              isActiveMenu(item)
                                ? "bg-linear-to-r from-amber-100 to-orange-100 text-amber-700"
                                : "text-gray-600 hover:bg-amber-50 hover:text-gray-900"
                            }`}
                          >
                            <div className="flex items-center">
                              <item.icon
                                className={`mr-4 h-6 w-6 ${
                                  isActiveMenu(item)
                                    ? "text-amber-600"
                                    : "text-gray-400 group-hover:text-gray-500"
                                }`}
                              />
                              {item.name}
                            </div>
                            {openMenus[item.name] ? (
                              <FaChevronDown className="h-4 w-4" />
                            ) : (
                              <FaChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          {openMenus[item.name] && (
                            <ul className="mt-1 ml-8 space-y-1">
                              {item.submenu.map((subItem) => (
                                <li key={subItem.name}>
                                  <Link
                                    to={subItem.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                      location.pathname === subItem.href
                                        ? "bg-amber-500 text-white"
                                        : "text-gray-600 hover:bg-amber-50 hover:text-gray-900"
                                    }`}
                                  >
                                    {subItem.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                            location.pathname === item.href
                              ? "bg-linear-to-r from-amber-100 to-orange-100 text-amber-700"
                              : "text-gray-600 hover:bg-amber-50 hover:text-gray-900"
                          }`}
                        >
                          <item.icon
                            className={`mr-4 h-6 w-6 ${
                              location.pathname === item.href
                                ? "text-amber-600"
                                : "text-gray-400 group-hover:text-gray-500"
                            }`}
                          />
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
              <div className="border-t-2 border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-4">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <FaUserCircle className="h-10 w-10 text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700">
                      {user?.name}
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-auto text-gray-500 hover:text-red-500"
                  >
                    <FaSignOutAlt className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;