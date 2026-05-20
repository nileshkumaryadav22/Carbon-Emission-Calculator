const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Local fallback database of environmental advice
const LOCAL_BOT_RESPONSES = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    response: "Hello! I am EcoBot, your environmental assistant. I'm here to help you calculate your carbon footprint, understand emission sources, and find actionable ways to live a greener, more sustainable life. What would you like to discuss today?"
  },
  {
    keywords: ['transport', 'car', 'bike', 'flight', 'travel', 'bus', 'train', 'vehicle'],
    response: "Transportation is a major driver of greenhouse gases. To lower your transport emissions:\n\n1. **Use Public Transport:** Buses and trains generate up to 80% less CO2 per passenger-mile than individual cars.\n2. **Carpool/Active Travel:** Combine trips, walk, or ride a bicycle for short distances.\n3. **Switch to EV/CNG:** If driving is essential, electric vehicles and compressed natural gas vehicles produce significantly lower emissions.\n4. **Fly Less:** Flight emissions are highly concentrated. Direct flights produce less than connecting flights, and flying economy has a smaller footprint per seat."
  },
  {
    keywords: ['electric', 'ac', 'fan', 'light', 'appliance', 'electricity', 'energy', 'power'],
    response: "Household energy consumption has a substantial footprint. Try these reduction methods:\n\n1. **AC Optimization:** Keep your AC temperature set to 24-26°C. Each degree higher saves around 6% electricity.\n2. **Energy Efficient Lights:** Replace fluorescent and incandescent tubes with LED bulbs (which use 75-80% less power).\n3. **Unplug Phantom Load:** Chargers, TVs, and microwave displays draw standby power even when idle. Unplug them when not in use.\n4. **Energy Star Ratings:** When buying appliances, look for 5-star BEE labels which indicate peak efficiency."
  },
  {
    keywords: ['food', 'meat', 'vegetarian', 'vegan', 'dairy', 'diet', 'beef', 'chicken', 'fast food'],
    response: "Food systems account for nearly 26% of global carbon emissions. Tips to reduce diet footprint:\n\n1. **Eat More Plants:** Transitioning to a plant-rich diet (or adopting 'Meatless Mondays') can slash your diet footprint by 50%.\n2. **Cut Down Dairy:** Milk, cheese, and butter have high emission rates due to methane from cows. Try almond, soy, or oat alternatives.\n3. **Avoid Food Waste:** Decomposing food waste in landfills generates methane, a gas 25x more potent than CO2. Buy only what you need!\n4. **Eat Local & Seasonal:** Transportation emissions are lower for local produce compared to imported fruits and vegetables."
  },
  {
    keywords: ['internet', 'device', 'gaming', 'laptop', 'streaming', 'mobile', 'digital', 'screen'],
    response: "Our digital carbon footprint comes from datacenters, network infrastructure, and consumer devices. Reduce it by:\n\n1. **Stream Smart:** Stream video in Standard Definition (SD) instead of 4K/HD. It uses up to 80% less bandwidth and server load.\n2. **Extend Device Lifespan:** Manufacturing a phone or laptop accounts for 80% of its lifetime carbon footprint. Repair devices instead of upgrading immediately.\n3. **Turn Off Screens:** Don't leave your TV or computer gaming setups running in the background. Enable automatic sleep modes.\n4. **Green Hosting:** Support websites and cloud providers that run on 100% renewable energy."
  },
  {
    keywords: ['lpg', 'coal', 'wood', 'fuel', 'combustion', 'gas', 'cylinder'],
    response: "Direct fuel usage from cooking and heating contributes directly to CO2 in the atmosphere:\n\n1. **Efficient Cooking:** Use pressure cookers, cover pots with lids while boiling, and use flat-bottomed pans that match burner sizes to conserve LPG.\n2. **Avoid Coal & Wood:** Wood smoke and coal soot release particulate matter (PM2.5) and high CO2. Switch to cleaner alternatives like electric induction cookers or solar cookers.\n3. **Insulate Your Space:** Properly sealing windows and doors reduces heat loss, minimizing the need for space heating fuels."
  },
  {
    keywords: ['badge', 'score', 'environmental', 'improve', 'leaderboard', 'rank'],
    response: "Your environmental score is computed dynamically based on your average monthly carbon footprint. \n\n* **Under 200 kg CO2/month:** High score (80-100), unlocks **Carbon Zero Hero** or **Eco Warrior**.\n* **200 to 500 kg CO2/month:** Medium score (50-79), unlocks **Green Commuter**.\n* **Above 500 kg CO2/month:** Lower score, keeps you as an **Eco Novice**.\n\nYou can raise your score and claim shiny new badges on the Leaderboard by logging lower-emission records and completing habits in the **Recommendations** tab!"
  },
  {
    keywords: ['how', 'reduce', 'calculator', 'steps', 'calculate', 'footprint', 'carbon'],
    response: "To use this app to calculate and reduce emissions:\n\n1. Go to the **Calculator** tab on the left sidebar.\n2. Enter details in the Transportation, Electricity, Food, Digital, and Fuel sub-modules.\n3. Hit **Save Record** to record the analysis to your dashboard history.\n4. View your **Dashboard** trend graphs and visual pie charts.\n5. Navigate to the **Recommendations** checklist to adopt green habits and watch your footprint decline!"
  }
];

/**
 * @route   POST /api/chatbot
 * @desc    Interact with the AI assistant (Supports Gemini API or local NLP fallback)
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please enter a message' });
    }

    const prompt = message.toLowerCase().trim();
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Check if Gemini API Key is available
    if (apiKey && apiKey !== '' && !apiKey.startsWith('YOUR_')) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const systemInstruction = 
          "You are EcoBot, a helpful, enthusiastic, and highly knowledgeable AI sustainability assistant. " +
          "Answer user questions related to carbon footprint reduction, climate change, green habits, " +
          "sustainable transport, electricity conservation, waste management, and environmental science. " +
          "Keep responses concise, well-structured using bullet points, and highly encouraging. " +
          "If the user asks something completely unrelated to environmental science, sustainability, or carbon footprint, " +
          "politely redirect them back to eco-friendly discussions.";

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemInstruction}\n\nUser Question: ${message}` }
                ]
              }
            ]
          })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
          const aiResponse = data.candidates[0].content.parts[0].text;
          return res.json({ success: true, response: aiResponse, source: 'gemini' });
        } else {
          console.warn('Gemini response structure unexpected, falling back to local database...');
        }
      } catch (geminiError) {
        console.error('Gemini API Error:', geminiError.message);
        // Fallback to local keyword matcher
      }
    }

    // 2. Keyword fallback logic
    let matchedResponse = null;

    // Search matches
    for (const item of LOCAL_BOT_RESPONSES) {
      const match = item.keywords.some(keyword => prompt.includes(keyword));
      if (match) {
        matchedResponse = item.response;
        break;
      }
    }

    // Default if no keywords match
    if (!matchedResponse) {
      matchedResponse = 
        "That's an interesting question! While I don't have a specific answer for that, you can improve your climate impact by " +
        "focusing on the core categories: reducing flights/driving, lowering home electricity consumption, choosing plant-based diets, " +
        "and reducing digital streaming time. \n\nFeel free to ask me specifically about **transportation**, **electricity**, **food**, " +
        "**internet usage**, or **how to raise your environmental score**!";
    }

    res.json({
      success: true,
      response: matchedResponse,
      source: 'local_nlp_fallback'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
