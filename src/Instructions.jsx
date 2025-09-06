import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import kalasalingam from "/public/kalasalingam.png";
import score from "/public/scorecraft.jpg";
// Importing the GIF from your project files
import narutoGif from "/public/W4W.gif";

const narutoBgImage = "https://images.alphacoders.com/605/605592.png";

const narutoFontStyle = {
    fontFamily: "'Ninja Naruto', sans-serif",
};

// --- Animation Variants for Staggered Effect ---
const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
    },
  },
};


function Instructions() {
    const nav = useNavigate();

    const eventInstructions = [
        "Your team password will be provided by an admin. Do not share it with other teams.",
        "You will receive a random domain at the start. This domain will be used for all challenges.",
        "If you encounter any issues, use the 'Request Assistance' feature in your Team Panel. Our support team will reach you.",
        "For any login problems, please contact the nearest club member. They are stationed in each sector to help you.",
        "Keep your QR codes ready for attendance. This is crucial for tracking your presence at checkpoints."
    ];

    return (
        <div 
            className="home relative w-full min-h-screen py-12 px-4 flex justify-center items-center overflow-y-auto"
            style={{
                backgroundImage: `url('${narutoBgImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>

            {/* NEW: Main container with a two-column grid layout for larger screens */}
            <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                
                {/* --- Left Column: Naruto GIF --- */}
                <motion.div 
                    className="hidden lg:flex justify-center items-center lg:col-span-2"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, type: 'spring' }}
                >
                    <img 
                        src={narutoGif} 
                        alt="Naruto scrolling through a scroll" 
                        className="rounded-2xl border-4 border-orange-500/40 shadow-2xl shadow-orange-500/20 w-full max-w-md"
                    />
                </motion.div>

                {/* --- Right Column: Page Content --- */}
                <div className="lg:col-span-3 flex flex-col gap-10">
                    {/* Header */}
                    <motion.div 
                        className="p-8 rounded-2xl bg-gray-900/70 border-2 border-orange-500/50 shadow-2xl w-full text-center backdrop-blur-md"
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, type: "spring", stiffness: 100, delay: 0.2 }}
                    >
                        <div className="w-full flex justify-center items-center gap-6 mb-6">
                            <img src={kalasalingam} className="w-20 h-20 object-contain bg-white/80 rounded-full p-1" alt="Kalasalingam Logo" />
                            <img src={score} className="w-20 h-20 object-cover rounded-full border-2 border-orange-400" alt="Score Logo" />
                        </div>
                        <h2 className="text-2xl mt-2 text-gray-300 tracking-wider">Scorecraft KARE Presents</h2>
                        
                        <motion.h1 
                            className="text-6xl md:text-7xl font-black text-orange-500 my-4 tracking-widest"
                            style={narutoFontStyle}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                        >
                            HackForge
                        </motion.h1>

                        <p className="text-lg text-gray-300">Welcome, shinobi! Here are the scrolls of knowledge for your mission.</p>
                    </motion.div>

                    {/* Instructions & Action Button */}
                    <motion.div 
                        className="p-8 bg-gray-900/80 text-white rounded-2xl shadow-xl border-2 border-orange-500/30 backdrop-blur-md w-full"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                    >
                        <h1 className="text-3xl font-extrabold mb-6 text-center text-orange-400" style={narutoFontStyle}>
                            Event Process
                        </h1>
                        
                        <motion.ul 
                            className="text-lg text-gray-200 space-y-4 mb-10"
                            variants={listContainerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {eventInstructions.map((text, idx) => (
                                <motion.li key={idx} className="flex items-start gap-3" variants={listItemVariants}>
                                    <span className="text-orange-400 font-bold text-xl pt-1">🍥</span>
                                    <p>{text}</p>
                                </motion.li>
                            ))}
                        </motion.ul>

                        <div className="flex justify-center">
                            <motion.button 
                                className="bg-orange-500 text-white border-2 border-orange-600 py-4 px-10 rounded-lg shadow-lg text-xl font-bold hover:bg-orange-600 transition-all duration-300 w-full md:w-auto"
                                whileHover={{ 
                                    scale: 1.1,
                                    boxShadow: "0px 0px 20px rgba(249, 115, 22, 0.7)",
                                    textShadow: "0px 0px 8px rgba(255, 255, 255, 0.7)",
                                    transition: { duration: 0.3 }
                                }}
                                whileTap={{ scale: 0.9 }}
                                animate={{
                                    scale: [1, 1.02, 1],
                                    transition: {
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }
                                }}
                                onClick={() => nav("/teamlogin")}
                            >
                                Proceed to Team Login
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default Instructions;