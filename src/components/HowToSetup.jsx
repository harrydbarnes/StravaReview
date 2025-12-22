import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import PropTypes from 'prop-types';

const HowToSetup = ({ isOpen, onClose }) => {
  const [hostname] = useState(window.location.hostname);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="howto-heading"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-zinc-900 border border-white/10 p-6 md:p-8 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <h2 id="howto-heading" className="text-2xl font-bold mb-6 text-white">How to Connect Strava</h2>

            <div className="space-y-6 text-gray-300">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-orange text-xs">1</span>
                  <h3>Go to Strava Settings</h3>
                </div>
                <p className="text-sm pl-8">
                  Log in to Strava and navigate to the API settings page.
                </p>
                <a
                  href="https://www.strava.com/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-8 inline-flex items-center gap-2 text-brand-orange hover:underline text-sm"
                >
                  Open Strava API Settings <ExternalLink size={14} />
                </a>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-orange text-xs">2</span>
                  <h3>Create an Application</h3>
                </div>
                <div className="pl-8 text-sm space-y-2">
                  <p>If you don&apos;t have one, create a new application with:</p>
                  <ul className="list-disc pl-4 space-y-1 text-gray-400">
                    <li><strong>Application Name:</strong> Wrapped App (or similar - just don't mention the word Strava!)</li>
                    <li><strong>Category:</strong> Visualizer</li>
                    <li><strong>App Icon:</strong> Upload any image (required)</li>
                    <li><strong>Authorization Callback Domain:</strong>
                        <code className="mx-1 px-1 bg-white/10 rounded select-all">{hostname}</code>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">
                    Note: The &quot;Authorization Callback Domain&quot; must match the domain in your address bar ({hostname}).
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-orange text-xs">3</span>
                  <h3>Copy Credentials</h3>
                </div>
                <p className="text-sm pl-8">
                  Copy your <strong>Client ID</strong> and <strong>Client Secret</strong> from Strava and paste them into the form on the page - click 'Got it' when ready.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

HowToSetup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default HowToSetup;
