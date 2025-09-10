import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, QrCode, Gamepad2, HelpCircle, UserCheck, Layers } from 'lucide-react';
import kalasalingam from "/public/kalasalingam.png";
import score from "/public/scorecraft.jpg";

const narutoFontStyle = {
    fontFamily: "'Ninja Naruto', sans-serif",
};

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 100 },
    },
};

const iconVariants = {
    hover: {
        scale: 1.2,
        rotate: 10,
        transition: { type: 'spring', stiffness: 300 },
    }
};

const Section = ({ icon, title, children }) => (
    <motion.div variants={itemVariants} className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700">
        <div className="flex items-center gap-4 mb-4">
            <motion.div variants={iconVariants} whileHover="hover" className="text-orange-400">
                {icon}
            </motion.div>
            <h3 className="text-2xl font-bold text-orange-400">{title}</h3>
        </div>
        <div className="space-y-3 text-gray-300 pl-2 border-l-2 border-orange-500/30">
            {children}
        </div>
    </motion.div>
);

function Instructions() {
    const nav = useNavigate();

    return (
        <div 
            className="relative w-full min-h-screen py-12 px-4 flex items-center overflow-y-auto bg-black"
        >
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url('https://images.alphacoders.com/605/605592.png')` }}
            ></div>
            <div className="absolute inset-0 bg-black/60"></div>
            
            <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                
                {/* --- Left Column: Header and GIF --- */}
                <div className="lg:sticky top-12 flex flex-col gap-10">
                    <motion.div 
                        className="p-8 rounded-2xl bg-gray-900/70 border-2 border-orange-500/50 shadow-2xl text-center backdrop-blur-md"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, type: "spring" }}
                    >
                        <div className="w-full flex justify-center items-center gap-6 mb-4">
                            <img src={kalasalingam} className="w-20 h-20 object-contain bg-white/80 rounded-full p-1" alt="Kalasalingam Logo" />
                            <img src={score} className="w-20 h-20 object-cover rounded-full border-2 border-orange-400" alt="Score Logo" />
                        </div>
                        <h2 className="text-xl text-gray-300 tracking-wider">Scorecraft KARE Presents</h2>
                        <motion.h1 
                            className="text-6xl md:text-7xl font-black text-orange-500 my-3 tracking-widest"
                            style={narutoFontStyle}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                        >
                            HackForge
                        </motion.h1>
                    </motion.div>
                    <motion.div 
                        className="flex justify-center items-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.5, type: 'spring' }}
                    >
                        <img 
                            src={"https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3end2dWxnZ2xmNDd4MmNpdWF2aXVxN25pZTB5eDA1OGswYTVxd2dmdiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Hld1RfHBeQDmM/giphy.gif"} 
                            alt="Naruto Mission Scroll" 
                            className="rounded-2xl border-4 border-orange-500/40 shadow-2xl shadow-orange-500/20 w-full max-w-md"
                        />
                    </motion.div>
                                        <motion.div 
                        className="flex justify-center items-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.5, type: 'spring' }}
                    >
                        <img 
                            src={"https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MGZjM2t2b2t2and2Nmk4aDZiMXJqcGdmMmc3OWdjYnZzMWgzd3EyYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/a3wq0KrRi6e76/giphy.gif"} 
                            alt="Naruto Mission Scroll" 
                            className="rounded-2xl border-4 border-orange-500/40 shadow-2xl shadow-orange-500/20 w-full max-w-md"
                        />
                    </motion.div>
                </div>

                {/* --- Right Column: Instructions --- */}
                <motion.div 
                    className="flex flex-col gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Section icon={<ShieldCheck size={32} />} title="General Rules & Credentials">
                        <p><strong>ID Cards are Mandatory:</strong> All participants must wear their official college ID cards at all times.</p>
                        <p><strong>Team Password:</strong> Your unique team password will be provided by an admin after verification. Keep it secret and do not share it.</p>
                        <p><strong>Login Issues:</strong> For any login problems, find the nearest club member in your assigned sector for immediate assistance.</p>
                    </Section>
                    
                    <Section icon={<QrCode size={32} />} title="Attendance Protocol">
                        <p><strong>Unique QR Codes:</strong> Each team member receives a unique QR code after verification. This is your digital pass for the event.</p>
                        <p><strong>7 Attendance Rounds:</strong> Attendance will be marked at 7 checkpoints throughout the event. It is crucial to be present for each one.</p>
                        <p><strong>Keep it Ready:</strong> Have your QR code accessible on your mobile device at all times for quick scanning by the organizers.</p>
                    </Section>

                    {/* --- UPDATED DOMAIN SELECTION SECTION --- */}
                    <Section icon={<Layers size={32} />} title="Domain & Problem Selection">
                        <p><strong>Explore the Sets:</strong> Domains are grouped into 3 distinct sets. Your team lead can select any set to view its problem statements.</p>
                        <p><strong>Review Problem Statements:</strong> Inside a set, you can browse through the available problem statements. Take your time to choose the one that best fits your team's skills.</p>
                        <p><strong>Flexible Choice:</strong> If you're not satisfied with the problems in one set, simply click 'Cancel' to return and explore a different set.</p>
                        <p><strong>Confirm Your Mission:</strong> Once you've chosen a problem statement and click 'Confirm', your domain and problem are locked in. This choice is final!</p>
                    </Section>

                    <Section icon={<Gamepad2 size={32} />} title="Side-Quest Game Rules">
                        <p><strong>Memory Flip Challenge:</strong> Match all pairs of cards as quickly as you can. Your score is based on speed and accuracy.</p>
                        <p><strong>Number Puzzle:</strong> A classic sliding puzzle. Solve it in the fewest moves and the shortest time for a higher score.</p>
                        <p><strong>Flash game Challenge:</strong> Repeat the sequence perfectly. It gets longer and faster each round.</p>
                        <p><strong>One Shot Only:</strong> Each game can be played only once per team. Make it count!</p>
                    </Section>
                    
                    <Section icon={<HelpCircle size={32} />} title="Requesting Assistance">
                        <p><strong>Technical Issues:</strong> If you face any technical problems with the platform, use the "Request Help" button in your dashboard.</p>
                        <p><strong>Describe Your Issue:</strong> Provide a clear and concise description of your problem. Our support team will be notified and will come to your location.</p>
                        <p><strong>Check the Intel Feed:</strong> The status of your request will be updated in the "Intel Feed" section on your dashboard.</p>
                    </Section>
                    
                    <motion.div variants={itemVariants} className="flex justify-center mt-4">
                        <motion.button 
                            className="bg-orange-500 text-white border-2 border-orange-600 py-4 px-10 rounded-lg shadow-lg text-xl font-bold hover:bg-orange-600 transition-all duration-300 w-full"
                            whileHover={{ 
                                scale: 1.05,
                                boxShadow: "0px 0px 20px rgba(249, 115, 22, 0.7)",
                                textShadow: "0px 0px 8px rgba(255, 255, 255, 0.7)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => nav("/home")}
                        >
                            Proceed to Team Login
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

export default Instructions;