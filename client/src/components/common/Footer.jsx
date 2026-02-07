import { Link } from 'react-router-dom';
import { Github, Twitter, Mail } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Footer Component
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { isDark } = useTheme();
    return (
        <footer className="bg-dark-800 border-t border-dark-700">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link to="/" className="flex items-center space-x-3 mb-4">
                            <img 
                                src={isDark ? "/mini-logo.png" : "/mini-logo-light.png"} 
                                alt="NagarSathi" 
                                className="h-12 w-auto"
                            />
                        </Link>
                        <p className="text-dark-400 max-w-md">
                            Empowering citizens to report and track civic issues in their
                            community. Together, we can make our neighborhoods better places
                            to live.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-dark-400 hover:text-primary-400 transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/map" className="text-dark-400 hover:text-primary-400 transition-colors">
                                    Issue Map
                                </Link>
                            </li>
                            <li>
                                <Link to="/report" className="text-dark-400 hover:text-primary-400 transition-colors">
                                    Report Issue
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Connect</h3>
                        <div className="flex space-x-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center text-dark-400 hover:bg-primary-600 hover:text-white transition-all duration-200"
                            >
                                <Github size={20} />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center text-dark-400 hover:bg-primary-600 hover:text-white transition-all duration-200"
                            >
                                <Twitter size={20} />
                            </a>
                            <a
                                href="mailto:contact@nagarsathi.com"
                                className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center text-dark-400 hover:bg-primary-600 hover:text-white transition-all duration-200"
                            >
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-dark-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-dark-500 text-sm">
                        © {currentYear} NagarSathi. All rights reserved.
                    </p>
                    <p className="text-dark-500 text-sm mt-2 sm:mt-0">
                        Built with ❤️ for better communities
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
