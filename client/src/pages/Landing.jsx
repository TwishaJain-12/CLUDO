import { Link } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import {
    MapPin,
    MessageCircle,
    ArrowUp,
    CheckCircle,
    Users,
    Shield,
    Zap,
    ChevronRight,
} from 'lucide-react';
import Button from '../components/common/Button';
import Footer from '../components/common/Footer';

/**
 * Landing Page Component
 * Platform overview with call-to-action
 */
const Landing = () => {
    const features = [
        {
            icon: MapPin,
            title: 'Report Issues',
            description:
                'Easily report civic issues like potholes, garbage, and broken streetlights with photos and GPS location.',
        },
        {
            icon: MessageCircle,
            title: 'Community Engagement',
            description:
                'Upvote important issues and participate in discussions to prioritize community needs.',
        },
        {
            icon: CheckCircle,
            title: 'Track Progress',
            description:
                'Monitor the status of reported issues from submission to resolution with transparent updates.',
        },
        {
            icon: Shield,
            title: 'Accountability',
            description:
                'Admins provide resolution proof, ensuring transparency and trust in the process.',
        },
    ];

    const stats = [
        { value: '10K+', label: 'Issues Reported' },
        { value: '85%', label: 'Resolution Rate' },
        { value: '50K+', label: 'Active Citizens' },
        { value: '100+', label: 'Areas Covered' },
    ];

    return (
        <div className="min-h-screen bg-dark-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-900 to-dark-900" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-3xl" />

                <div className="relative container-custom pt-20 pb-32 sm:pt-32 sm:pb-40">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2 mb-8">
                            <Zap size={16} className="text-primary-400" />
                            <span className="text-primary-300 text-sm font-medium">
                                Empowering Citizens, Building Better Communities
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                            Report Civic Issues.{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-400">
                                Track Progress.
                            </span>{' '}
                            Make a Difference.
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-xl text-dark-300 mb-10 max-w-2xl mx-auto">
                            NagarSathi connects citizens with local authorities to report and
                            resolve civic issues faster. From potholes to broken streetlights,
                            your voice matters.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <SignedOut>
                                <Link to="/sign-up">
                                    <Button size="xl" icon={ChevronRight} iconPosition="right">
                                        Get Started Free
                                    </Button>
                                </Link>
                                <Link to="/map">
                                    <Button variant="secondary" size="xl">
                                        Explore Issue Map
                                    </Button>
                                </Link>
                            </SignedOut>
                            <SignedIn>
                                <Link to="/report">
                                    <Button size="xl" icon={MapPin}>
                                        Report an Issue
                                    </Button>
                                </Link>
                                <Link to="/">
                                    <Button variant="secondary" size="xl">
                                        View Issues Feed
                                    </Button>
                                </Link>
                            </SignedIn>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative -mt-16 z-10">
                <div className="container-custom">
                    <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="text-3xl sm:text-4xl font-bold text-primary-400 mb-2">
                                    {stat.value}
                                </p>
                                <p className="text-dark-400 text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-subtitle max-w-2xl mx-auto">
                            NagarSathi makes civic engagement simple and effective
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                                    <feature.icon size={24} className="text-primary-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-dark-400 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-b from-dark-900 via-primary-900/10 to-dark-900">
                <div className="container-custom text-center">
                    <div className="max-w-2xl mx-auto">
                        <Users size={48} className="text-primary-400 mx-auto mb-6" />
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Join Thousands of Active Citizens
                        </h2>
                        <p className="text-dark-300 text-lg mb-8">
                            Be part of the change. Report issues in your area and help build a
                            better community for everyone.
                        </p>
                        <SignedOut>
                            <Link to="/sign-up">
                                <Button size="xl">Create Free Account</Button>
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <Link to="/report">
                                <Button size="xl">Report Your First Issue</Button>
                            </Link>
                        </SignedIn>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Landing;
