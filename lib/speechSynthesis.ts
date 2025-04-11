// Check if speech synthesis is available in the browser
export const isSpeechSynthesisSupported = (): boolean => {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
};

// Wait for voices to be loaded (necessary in some browsers)
export const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    // Clear any existing speech (sometimes helps reset the API)
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
    }

    const voices = window.speechSynthesis.getVoices();

    if (voices && voices.length > 0) {
      resolve(voices);
      return;
    }

    // Chrome and some other browsers load voices asynchronously
    const voicesChangedHandler = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          voicesChangedHandler
        );
      }
    };

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      voicesChangedHandler
    );

    // Safety timeout to prevent hanging (after 2 seconds, resolve with whatever we have)
    setTimeout(() => {
      const fallbackVoices = window.speechSynthesis.getVoices();
      if (fallbackVoices && fallbackVoices.length > 0) {
        resolve(fallbackVoices);
      } else {
        // If no voices available, resolve with empty array
        resolve([]);
      }
    }, 2000);
  });
};

// Speech synth sometimes gets stuck due to browser bugs, this helps reset it
export const resetSpeechSynthesis = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();

    // Edge case fix for some browsers that get stuck
    if (window.speechSynthesis.speaking) {
      setTimeout(() => {
        window.speechSynthesis.cancel();
      }, 100);
    }
  }
};

// Get the best available voice
export const getBestVoice = async (
  preferredLanguage = "en-US"
): Promise<SpeechSynthesisVoice | null> => {
  if (!isSpeechSynthesisSupported()) return null;

  try {
    const voices = await getVoices();

    if (!voices || voices.length === 0) {
      console.warn("No voices available for speech synthesis");
      return null;
    }

    console.log(
      "Available voices:",
      voices.map((v) => `${v.name} (${v.lang})`)
    );

    // Prioritize voices in this order:
    // 1. Google premium voices in the preferred language
    // 2. Any premium/neural/natural voices in the preferred language
    // 3. Any voice in the preferred language
    // 4. English Google voices
    // 5. Any English voice
    // 6. Any voice

    const languageVoices = voices.filter((voice) =>
      voice.lang.startsWith(preferredLanguage.split("-")[0])
    );

    // Look for premium quality voices first
    const premiumVoice = languageVoices.find(
      (voice) =>
        voice.name.includes("Premium") ||
        voice.name.includes("Neural") ||
        voice.name.includes("Natural") ||
        voice.name.includes("Enhanced") ||
        (voice.name.includes("Google") &&
          !voice.name.includes("Google US Spanish"))
    );

    if (premiumVoice) {
      console.log("Using premium voice:", premiumVoice.name);
      return premiumVoice;
    }

    // If no premium voice, look for any voice in the right language
    if (languageVoices.length > 0) {
      console.log("Using language voice:", languageVoices[0].name);
      return languageVoices[0];
    }

    // Fall back to any English voice
    const englishVoice = voices.find((voice) => voice.lang.startsWith("en"));

    if (englishVoice) {
      console.log("Using English fallback voice:", englishVoice.name);
      return englishVoice;
    }

    // Last resort: just use any available voice
    console.log("Using default voice:", voices[0]?.name || "unknown");
    return voices[0] || null;
  } catch (error) {
    console.error("Error getting voices:", error);
    return null;
  }
};

// Helper function to split text into smaller chunks at sentence boundaries
function splitTextIntoChunks(text: string, maxChunkLength: number): string[] {
  // Extract complete sentences
  const sentenceRegex = /[^.!?]+[.!?]+\s*/g;
  const sentences = text.match(sentenceRegex) || [text];

  console.log("Detected sentences:", sentences.length);

  const chunks: string[] = [];
  let currentChunk = "";

  // Process each complete sentence
  for (const sentence of sentences) {
    // If this sentence alone is longer than the max length, we need to split it further
    if (sentence.length > maxChunkLength) {
      // First add any existing chunk
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = "";
      }

      // Split the long sentence by clauses (commas, semicolons, etc.)
      const clauses = sentence.split(/([,;:])/);
      let clauseChunk = "";

      for (let i = 0; i < clauses.length; i++) {
        const clause = clauses[i];

        if (clauseChunk.length + clause.length <= maxChunkLength) {
          clauseChunk += clause;
        } else {
          // If we have a chunk, add it
          if (clauseChunk) {
            chunks.push(clauseChunk);
          }

          // If the clause itself is too long, we need to split by words
          if (clause.length > maxChunkLength) {
            const words = clause.split(/\s+/);
            let wordChunk = "";

            for (const word of words) {
              if (wordChunk.length + word.length + 1 <= maxChunkLength) {
                wordChunk += (wordChunk ? " " : "") + word;
              } else {
                if (wordChunk) chunks.push(wordChunk);
                wordChunk = word;
              }
            }

            if (wordChunk) clauseChunk = wordChunk;
            else clauseChunk = "";
          } else {
            clauseChunk = clause;
          }
        }
      }

      // Add any remaining clause chunk
      if (clauseChunk) chunks.push(clauseChunk);
    }
    // If adding this sentence would exceed the max length, start a new chunk
    else if (currentChunk.length + sentence.length > maxChunkLength) {
      chunks.push(currentChunk);
      currentChunk = sentence;
    }
    // Otherwise add to the current chunk
    else {
      currentChunk += sentence;
    }
  }

  // Add any remaining text
  if (currentChunk) {
    chunks.push(currentChunk);
  }

  // Filter out empty chunks and trim whitespace
  const finalChunks = chunks
    .filter((chunk) => chunk.trim().length > 0)
    .map((chunk) => chunk.trim());

  console.log("Created chunks:", finalChunks.length);
  return finalChunks;
}

// Speak text with the best available voice
export const speakText = async (text: string): Promise<boolean> => {
  if (!isSpeechSynthesisSupported()) {
    console.error("Speech synthesis not supported in this browser");
    return false;
  }

  try {
    // Reset any existing speech
    resetSpeechSynthesis();

    const bestVoice = await getBestVoice();

    // Some browsers have issues with very long text, so we'll
    // try the full text first, but fall back to chunking if needed

    // Try speaking the full text first - most modern browsers can handle it
    return new Promise<boolean>(async (resolve) => {
      try {
        console.log("Attempting to speak entire summary at once");

        const utterance = new SpeechSynthesisUtterance(text);

        // Configure the utterance
        if (bestVoice) utterance.voice = bestVoice;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Set up event handlers
        utterance.onend = () => {
          console.log("Successfully finished speaking entire summary");
          resolve(true);
        };

        utterance.onerror = (event) => {
          console.warn("Error speaking entire text:", event);
          console.log("Falling back to chunked speech...");

          // If speaking the whole text fails, fall back to chunking
          speakInChunks(text, bestVoice)
            .then(resolve)
            .catch(() => resolve(false));
        };

        // Start speaking the entire text
        window.speechSynthesis.speak(utterance);

        // Safety timeout - if after 500ms the speech synthesis seems stuck,
        // fall back to chunking (some browsers report success but don't actually speak)
        setTimeout(() => {
          if (
            window.speechSynthesis.speaking &&
            !document.hidden && // Only do this if page is visible
            utterance.onend === null
          ) {
            // Chrome bug - sometimes onend gets nullified

            console.warn(
              "Speech synthesis may be stuck, falling back to chunking"
            );
            resetSpeechSynthesis();

            speakInChunks(text, bestVoice)
              .then(resolve)
              .catch(() => resolve(false));
          }
        }, 500);
      } catch (error) {
        console.error(
          "Error in speech synthesis, falling back to chunking:",
          error
        );

        // Fall back to chunking on any error
        speakInChunks(text, bestVoice)
          .then(resolve)
          .catch(() => resolve(false));
      }
    });
  } catch (error) {
    console.error("Error speaking text:", error);
    return false;
  }
};

// Helper function to speak text in chunks if necessary
async function speakInChunks(
  text: string,
  voice: SpeechSynthesisVoice | null
): Promise<boolean> {
  console.log("Using chunked speech as fallback");

  const maxChunkSize = 200;
  const chunks = splitTextIntoChunks(text, maxChunkSize);
  console.log(`Speaking text in ${chunks.length} chunks`);

  return new Promise<boolean>((resolve) => {
    let currentChunkIndex = 0;

    // Function to speak the next chunk
    const speakNextChunk = () => {
      if (currentChunkIndex >= chunks.length) {
        resolve(true);
        return;
      }

      const chunk = chunks[currentChunkIndex];
      console.log(`Speaking chunk ${currentChunkIndex + 1}/${chunks.length}`);

      const utterance = new SpeechSynthesisUtterance(chunk);

      // Configure the utterance
      if (voice) utterance.voice = voice;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // When this chunk ends, speak the next one
      utterance.onend = () => {
        currentChunkIndex++;
        // Add a small pause between chunks for more natural speech
        setTimeout(speakNextChunk, 100);
      };

      // Handle errors
      utterance.onerror = () => {
        currentChunkIndex++;
        setTimeout(speakNextChunk, 100);
      };

      window.speechSynthesis.speak(utterance);
    };

    // Start the sequence
    speakNextChunk();
  });
}
