import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'Overview and analytics'
    },
    {
      name: 'Contracts',
      href: '/dashboard',
      icon: DocumentTextIcon,
      description: 'Manage your contracts'
    },
    {
      name: 'Upload',
      href: '/upload',
      icon: CloudArrowUpIcon,
      description: 'Upload new contracts'
    },
    {
      name: 'Query',
      href: '/query',
      icon: MagnifyingGlassIcon,
      description: 'Ask questions about contracts'
    },
    {
      name: 'Insights',
      href: '/insights',
      icon: ChartBarIcon,
      description: 'AI-powered insights'
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: ChartBarIcon,
      description: 'Generate reports'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      description: 'Account settings'
    }
  ];

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 z-40">
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${active 
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon 
                  className={`
                    mr-3 h-5 w-5 flex-shrink-0 transition-colors
                    ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}
                  `} 
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span>{item.name}</span>
                    {item.name === 'Contracts' && (
                      <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white">
            <h3 className="text-sm font-semibold mb-1">
              Upgrade to Pro
            </h3>
            <p className="text-xs text-primary-100 mb-3">
              Get unlimited uploads and advanced AI insights
            </p>
            <button className="w-full bg-white text-primary-600 text-xs font-medium py-2 px-3 rounded-md hover:bg-primary-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="p-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              Need help?
            </p>
            <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
