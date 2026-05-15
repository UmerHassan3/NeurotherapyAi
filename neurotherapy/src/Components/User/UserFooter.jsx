
export default function UserFooter() {
    const Link=[
        {name:"Home",link:"/"},
        {name:"Profile",link:"/profile"},
        {name:"Therapy Sessions",link:"/therapy"},
        {name:"Policies",link:"/policies"},
    ]
    return (
        <footer className="w-full bg-black text-white mt-16 border-t-4 border-red-600">

            <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Brand Section */}
                <div>
                    <h2 className="text-2xl font-bold text-red-600">
                        Neuro-Therapy Companion
                    </h2>
                    <p className="text-gray-300 mt-3 text-sm leading-relaxed">
                        An AI-powered emotional wellness platform integrating EEG signals,
                        machine learning, and guided therapy to improve mental health and
                        cognitive balance.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-semibold text-red-500 mb-3">
                        Quick Links
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                        {Link.map((link, index) => (
                            <li
                                key={index}
                                className="hover:text-red-500 cursor-pointer"
                                onClick={() => window.location.href = link.link}
                            >
                                {link.name}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact / Info */}
                <div>
                    <h3 className="text-lg font-semibold text-red-500 mb-3">
                        Contact
                    </h3>
                    <p className="text-gray-300 text-sm">
                        Email: neurotherapyai@gmail.com
                    </p>
                    <p className="text-gray-300 text-sm mt-2">
                        Location: Lahore, Pakistan
                    </p>

                    <div className="mt-4">
                        <span className="inline-block bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                            AI Mental Health System
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 text-center py-4 text-gray-400 text-sm">
                © {new Date().getFullYear()} Neuro-Therapy Companion. All rights reserved.
            </div>

        </footer>
    )
}