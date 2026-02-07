import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Sign Up Page
 * Clean, centered layout with branding and theme toggle
 */
const SignUpPage = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className={`min-h-screen flex flex-col ${isDark ? 'bg-dark-900' : 'bg-gray-100'}`}>
            {/* Header with logo and theme toggle */}
            <header className="w-full py-4 px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <img
                        src={`${isDark ? '/mini-logo.png' : '/mini-logo-light.png'}`}
                        alt="NagarSathi"
                        className="w-auto h-16 rounded-lg"
                    />
                </Link>

                <button
                    onClick={toggleTheme}
                    className={`p-2.5 rounded-lg border transition-all ${isDark
                        ? 'bg-dark-800 border-dark-700 text-dark-300 hover:text-white hover:bg-dark-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </header>

            {/* Main content - centered */}
            <main className="flex-1 flex items-center justify-center px-4 py-6 sm:p-6 lg:p-8">
                <div className="w-full max-w-md">
                    {/* Card with heading inside */}
                    <div className={`rounded-xl p-5 sm:p-6 md:p-8 ${isDark ? 'bg-dark-800 border border-dark-700' : 'bg-white shadow-lg'}`}>
                        {/* Welcome text inside card */}
                        <div className="text-center mb-6">
                            <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Create an account
                            </h1>
                            <p className={isDark ? 'text-dark-400' : 'text-gray-500'}>
                                Join NagarSathi and make a difference
                            </p>
                        </div>

                        {/* Clerk SignUp component */}
                        <SignUp
                            routing="path"
                            path="/sign-up"
                            signInUrl="/sign-in"
                            afterSignUpUrl="/"
                            appearance={{
                                elements: {
                                    rootBox: 'w-full',
                                    card: 'bg-transparent border-0 shadow-none !p-0 w-full',
                                    cardBox: 'shadow-none border-0 w-full',
                                    main: 'shadow-none w-full',
                                    form: 'w-full',
                                    formContainer: 'w-full',
                                    formFieldRow: 'w-full',
                                    formField: 'w-full',
                                    headerTitle: 'hidden',
                                    headerSubtitle: 'hidden',
                                    socialButtonsBlockButton: isDark
                                        ? 'bg-dark-700 border-dark-600 text-white hover:bg-dark-600'
                                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
                                    socialButtonsBlockButtonText: isDark ? 'text-white font-medium' : 'text-gray-700 font-medium',
                                    dividerLine: isDark ? 'bg-dark-600' : 'bg-gray-200',
                                    dividerText: isDark ? 'text-dark-400' : 'text-gray-400',
                                    formFieldLabel: isDark ? 'text-dark-300' : 'text-gray-600',
                                    formFieldInput: isDark
                                        ? 'bg-dark-700 border-dark-600 text-white placeholder:text-dark-500'
                                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400',
                                    formButtonPrimary: 'bg-primary-600 hover:bg-primary-700 text-white w-full',
                                    footer: 'hidden',
                                    identityPreviewText: isDark ? 'text-white' : 'text-gray-900',
                                    identityPreviewEditButton: 'text-primary-500',
                                    alternativeMethodsBlockButton: isDark ? 'text-dark-300 hover:text-white' : 'text-gray-500 hover:text-gray-700',
                                    badge: 'bg-primary-100 text-primary-700 border-primary-200',
                                }
                            }}
                        />
                    </div>

                    {/* Sign in link */}
                    <div className="mt-6 text-center">
                        <p className={isDark ? 'text-dark-400' : 'text-gray-500'}>
                            Already have an account?{' '}
                            <Link to="/sign-in" className="text-primary-500 hover:text-primary-400 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className={`py-4 text-center text-sm ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                <p>© {new Date().getFullYear()} NagarSathi. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default SignUpPage;
