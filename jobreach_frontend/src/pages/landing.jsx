import React from 'react';

const Landing = ({ onOpenLogin, onOpenSignup }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white px-8 py-6">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="text-2xl font-bold text-gray-800">
                        <div>JOB</div>
                        <div>REACH</div>
                    </div>
                    
                    {/* Auth Buttons */}
                    <div className="flex space-x-4">
                        <button 
                            onClick={onOpenLogin}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Sign in
                        </button>
                        <button 
                            onClick={onOpenSignup}
                            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="px-8 py-16">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        {/* Left side - Email automation illustration */}
                        <div className="flex-shrink-0 mr-16">
                            <div className="relative">
                                {/* Email envelope */}
                                <div className="w-32 h-24 bg-blue-500 rounded-lg flex items-center justify-center mb-4 relative">
                                    {/* Envelope flap */}
                                    <div className="absolute -top-2 left-0 right-0 h-16 bg-blue-600 rounded-t-lg transform rotate-3"></div>
                                    <div className="absolute -top-2 left-0 right-0 h-16 bg-blue-400 rounded-t-lg transform -rotate-3"></div>
                                    {/* Email icon */}
                                    <div className="text-white text-xl font-bold z-10">@</div>
                                    {/* Email lines */}
                                    <div className="absolute bottom-3 left-3 right-3 space-y-1">
                                        <div className="h-0.5 bg-blue-300 rounded w-3/4"></div>
                                        <div className="h-0.5 bg-blue-300 rounded w-1/2"></div>
                                    </div>
                                </div>
                                
                                {/* Automation indicators */}
                                <div className="flex space-x-2 items-center">
                                    {/* AI/automation symbols */}
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                        <div className="text-white text-sm font-bold">AI</div>
                                    </div>
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center - Main content */}
                        <div className="flex-1 text-center">
                            <h1 className="text-5xl font-bold text-gray-800 mb-8 leading-tight">
                                Streamline Your Job Hunt <br />
                                with <br/>AI-Powered Outreach
                            </h1>
                            
                           
                            
                        </div>

                        {/* Right side - Career illustration */}
                        <div className="flex-shrink-0 ml-16">
                            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center relative">
                                {/* Career/briefcase icon */}
                                <div className="w-16 h-12 bg-blue-600 rounded-sm relative">
                                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-blue-700 rounded-t-sm"></div>
                                    <div className="absolute top-2 left-2 w-3 h-1 bg-blue-300 rounded"></div>
                                    <div className="absolute top-4 left-2 w-4 h-1 bg-blue-300 rounded"></div>
                                    <div className="absolute top-6 left-2 w-2 h-1 bg-blue-300 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* How it works section */}
            <section className=" py-16 bg-white">
                <div className="max-w-6xl mx-auto px-8">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">How it works</h2>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="text-center p-6 rounded-lg hover:border hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl">📌</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Step 1</h3>
                            <h4 className="text-lg font-semibold text-gray-700 mb-3">Build Your Profile</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Upload your resume and set your job preferences — role, location, company type, and more. 
                                The better we know you, the better we can connect you.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="text-center p-6 rounded-lg hover:border hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Step 2</h3>
                            <h4 className="text-lg font-semibold text-gray-700 mb-3">Let Outreach Work for You</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Our system automatically finds matching roles and sends personalized cold emails or applications 
                                on your behalf — so you don't have to.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="text-center p-6 rounded-lg hover:border hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl">✅</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Step 3</h3>
                            <h4 className="text-lg font-semibold text-gray-700 mb-3">Get Responses. Land Interviews.</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Track replies, schedule interviews, and stay organized — all from one dashboard. 
                                Focus on preparing; we'll handle the rest.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Divider line */}
            <div className="bg-white py-8">
                <div className="max-w-6xl mx-auto px-8">
                    <hr className="border-t border-gray-300" />
                </div>
            </div>

            {/* How We're Different section */}
            <section className=" bg-gray-100 py-16">
                <div className="max-w-6xl mx-auto px-8">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-16">How We're Different</h2>
                    
                    <div className="space-y-16">
                        {/* Precision Targeting */}
                        <div className="flex items-center justify-between">
                            <div className="flex-1 pr-6">
                                {/* Targeting illustration */}
                                <div className="relative w-80 h-48 bg-white rounded-lg p-8 shadow-sm mx-auto hover:border hover:border-gray-300 hover:shadow-md transition-all duration-200">
                                    {/* Target/bullseye */}
                                    <div className="absolute left-8 top-8 w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <div className="w-16 h-16 bg-indigo-300 rounded-full flex items-center justify-center">
                                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                                <div className="w-4 h-4 bg-white rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Scattered dots representing non-targeted approach */}
                                    <div className="absolute right-8 top-4 w-3 h-3 bg-gray-300 rounded-full opacity-30"></div>
                                    <div className="absolute right-12 top-12 w-2 h-2 bg-gray-300 rounded-full opacity-30"></div>
                                    <div className="absolute right-6 top-20 w-2 h-2 bg-gray-300 rounded-full opacity-30"></div>
                                    {/* Arrow pointing to target */}
                                    <div className="absolute right-16 top-16 w-8 h-0.5 bg-indigo-600 transform rotate-45"></div>
                                    <div className="absolute right-14 top-14 w-2 h-2 border-t-2 border-r-2 border-indigo-600 transform rotate-45"></div>
                                </div>
                            </div>
                            {/* Vertical divider */}
                            <div className="w-px h-48 bg-gray-300 mx-6"></div>
                            <div className="flex-1 pl-6">
                                <div className="p-6 rounded-lg hover:border hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                                    <div className="flex items-center mb-4">
                                        <span className="text-3xl mr-4">🔍</span>
                                        <h3 className="text-2xl font-bold text-gray-800">Precision Targeting</h3>
                                    </div>
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        We don't just spray emails — we match your profile to roles that fit perfectly with your skills and preferences.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Human-like Messaging */}
                        <div className="flex items-center justify-between">
                            <div className="flex-1 pr-6">
                                {/* Message illustration */}
                                <div className="relative w-80 h-48 bg-white rounded-lg p-8 shadow-sm mx-auto hover:border hover:border-gray-300 hover:shadow-md transition-all duration-200">
                                    {/* Chat bubbles */}
                                    <div className="absolute left-8 top-8 w-32 h-16 bg-teal-100 rounded-lg p-3">
                                        <div className="space-y-1">
                                            <div className="h-2 bg-teal-300 rounded w-3/4"></div>
                                            <div className="h-2 bg-teal-300 rounded w-1/2"></div>
                                            <div className="h-2 bg-teal-300 rounded w-2/3"></div>
                                        </div>
                                    </div>
                                    <div className="absolute right-8 bottom-8 w-28 h-12 bg-blue-100 rounded-lg p-3">
                                        <div className="space-y-1">
                                            <div className="h-2 bg-blue-300 rounded w-full"></div>
                                            <div className="h-2 bg-blue-300 rounded w-3/4"></div>
                                        </div>
                                    </div>
                                    {/* Personalization elements */}
                                    <div className="absolute top-4 right-4 text-xl">✍️</div>
                                    <div className="absolute bottom-4 left-4 text-lg">💝</div>
                                </div>
                            </div>
                            {/* Vertical divider */}
                            <div className="w-px h-48 bg-gray-300 mx-6"></div>
                            <div className="flex-1 pl-6">
                                <div className="p-6 rounded-lg hover:border hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                                    <div className="flex items-center mb-4">
                                        <span className="text-3xl mr-4">✍️</span>
                                        <h3 className="text-2xl font-bold text-gray-800">Human-like Messaging</h3>
                                    </div>
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Each message is crafted to feel personal and authentic, not like automated spam that gets ignored.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Smart Follow-ups */}
                        <div className="flex items-center justify-between">
                            <div className="flex-1 pr-6">
                                {/* Follow-up timeline illustration */}
                                <div className="relative w-80 h-48 bg-white rounded-lg p-8 shadow-sm mx-auto hover:border hover:border-gray-300 hover:shadow-md transition-all duration-200">
                                    {/* Timeline */}
                                    <div className="absolute left-8 top-1/2 w-48 h-0.5 bg-pink-300"></div>
                                    {/* Timeline points */}
                                    <div className="absolute left-8 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-pink-600 rounded-full"></div>
                                    <div className="absolute left-24 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-pink-500 rounded-full"></div>
                                    <div className="absolute left-40 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-pink-400 rounded-full"></div>
                                    <div className="absolute left-56 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-pink-300 rounded-full"></div>
                                    {/* Email icons */}
                                    <div className="absolute left-6 top-8 text-sm">📧</div>
                                    <div className="absolute left-22 top-6 text-sm">📨</div>
                                    <div className="absolute left-38 top-10 text-sm">📩</div>
                                    {/* Clock icon */}
                                    <div className="absolute right-8 top-8 text-2xl">⏰</div>
                                </div>
                            </div>
                            {/* Vertical divider */}
                            <div className="w-px h-48 bg-gray-300 mx-6"></div>
                            <div className="flex-1 pl-6">
                                <div className="p-6 rounded-lg hover:border hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                                    <div className="flex items-center mb-4">
                                        <span className="text-3xl mr-4">📬</span>
                                        <h3 className="text-2xl font-bold text-gray-800">Smart Follow-ups</h3>
                                    </div>
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        We handle polite, timely nudges at the perfect intervals — so you don't have to remember or worry about timing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-200 py-16 my-8">
                <div className="max-w-6xl mx-auto px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        {/* Company Info */}
                        <div className="md:col-span-1">
                            <div className="text-2xl font-bold text-gray-700 mb-4">
                                <div>JOB</div>
                                <div>REACH</div>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Smarter job hunting through AI outreach
                            </p>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-700 mb-4">Product</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">How it works</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Success stories</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Features</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Pricing</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">FAQ</a></li>
                            </ul>
                        </div>

                        {/* Resources Links */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-700 mb-4">Resources</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Blog</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Resume builder</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Cold email tips</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Career guides</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Interview prep</a></li>
                            </ul>
                        </div>

                        {/* Company and Social Links */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-700 mb-4">Company</h3>
                            <ul className="space-y-2 mb-6">
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">About us</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Contact</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Terms of Service</a></li>
                            </ul>
                            
                            <h3 className="text-lg font-bold text-gray-700 mb-4">Social</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">LinkedIn</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">X (Twitter)</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">YouTube</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">GitHub</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="border-t border-gray-300 mt-12 pt-8 text-center">
                        <p className="text-gray-600">
                            © 2025 JobReach. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Landing;