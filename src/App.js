import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Sun, Moon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function App() {
  const [activeTab, setActiveTab] = useState('encrypt');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [message, setMessage] = useState('');
  const [encrypted, setEncrypted] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const generateKeys = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/rsa/generate-keys');
      setPublicKey(res.data.publicKey);
      setPrivateKey(res.data.privateKey);
      setEncrypted('');
      setDecrypted('');
      setMessage('');
      toast.success('🔑 RSA keys generated!');
    } catch (err) {
      toast.error('Failed to generate keys');
    }
  };

  useEffect(() => {
    generateKeys();
  }, []);

  const encryptMessage = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/rsa/encrypt', {
        publicKey,
        message,
      });
      setEncrypted(res.data.encrypted);
      setDecrypted('');
      toast.success('🔐 Message encrypted!');
    } catch (err) {
      toast.error('Encryption failed');
    }
  };

  const decryptMessage = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/rsa/decrypt', {
        privateKey,
        encryptedMessage: encrypted,
      });
      setDecrypted(res.data.decrypted);
      toast.success('🔓 Message decrypted!');
    } catch (err) {
      toast.error('Decryption failed');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast('Copied to clipboard ✨', { icon: '📋' });
  };

  const tabs = [
    { id: 'encrypt', label: '🔐 Encrypt' },
    { id: 'decrypt', label: '🔓 Decrypt' },
    { id: 'about', label: '👨‍💻 Made By' }
  ];

  return (
    <div className={`${darkMode ? 'bg-gray-950 text-white' : 'bg-gradient-to-br from-indigo-100 to-blue-200 text-gray-900'} min-h-screen py-10 px-4 transition duration-300 font-sans`}>
      <Toaster position="top-right" />
      <motion.div 
        initial={{ opacity: 0, y: -30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.7 }}
        className={`max-w-6xl mx-auto ${darkMode ? 'bg-gray-900' : 'bg-white'} p-10 rounded-3xl shadow-2xl border dark:border-gray-700`}
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-5xl font-extrabold text-indigo-700 dark:text-indigo-400 mb-2">🔐 RSA Tool</h1>
            <p className="text-md text-gray-600 dark:text-gray-400">Secure RSA Encryption and Decryption, made beautiful</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-full border hover:bg-indigo-100 dark:hover:bg-gray-800"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>
        </div>

        <div className="flex justify-center space-x-6 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-3 font-semibold text-lg rounded-full shadow transition duration-200 ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white text-gray-700 hover:scale-105'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab !== 'about' && (
          <div className="flex justify-center mb-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateKeys}
              className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-2xl hover:bg-blue-700 transition shadow-lg"
            >
              🔁 Generate RSA Keys
            </motion.button>
          </div>
        )}

        {activeTab !== 'about' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {[{ label: 'Public Key', value: publicKey, set: setPublicKey }, { label: 'Private Key', value: privateKey, set: setPrivateKey }].map((field, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-5 rounded-xl shadow-sm">
                <label className="block font-bold mb-2 text-sm uppercase tracking-wide text-gray-700 dark:text-gray-300">{field.label}</label>
                <div className="relative">
                  <textarea
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl pr-10 bg-white text-sm text-black"
                    rows="4"
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    placeholder={`Generated ${field.label.toLowerCase()} will appear here...`}
                  />
                  <button
                    onClick={() => copyToClipboard(field.value)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-white"
                    title="Copy"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'encrypt' && (
            <motion.div
              key="encrypt"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">Message</label>
              <textarea
                className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white text-black"
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message to encrypt..."
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="mt-4 bg-green-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-green-700 transition shadow-md"
                onClick={encryptMessage}
              >
                🔒 Encrypt
              </motion.button>

              {encrypted && (
                <div className="mt-6">
                  <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">Encrypted Message</label>
                  <textarea className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white text-black" rows="4" value={encrypted} readOnly />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'decrypt' && (
            <motion.div
              key="decrypt"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">Encrypted Message</label>
              <textarea
                className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white text-black"
                rows="4"
                value={encrypted}
                onChange={(e) => setEncrypted(e.target.value)}
                placeholder="Paste encrypted message here..."
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="mt-4 bg-yellow-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-yellow-700 transition shadow-md"
                onClick={decryptMessage}
              >
                🔓 Decrypt
              </motion.button>

              {decrypted && (
                <div className="mt-6">
                  <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">Decrypted Message</label>
                  <textarea className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white text-black" rows="4" value={decrypted} readOnly />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center"
            >
              <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">👨‍💻 About the Creator</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">This tool was crafted with ❤️ by Moinak Dey and Aayush.</p>
              <p className="text-gray-600 dark:text-gray-400">I love building elegant tools that empower people. Find more of my work on <a href="https://github.com/spaceexplorer06" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">GitHub</a>.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center text-sm text-gray-400 dark:text-gray-500 mt-12">
          © {new Date().getFullYear()} RSA Web Tool • Built with 💙 by Moinak and Aayush
        </div>
      </motion.div>
    </div>
  );
}
