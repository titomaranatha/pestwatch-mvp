// backend/services/triageEngine.js
function analyzeSymptoms(cropType, description) {
    const descLower = description.toLowerCase();
    
    // Default values
    let probablePest = "Unknown Pest";
    let confidence = 30;
    let actionGuidance = "Please wait for officer verification.";

    // Groundnut Rosette / Viral Disease Logic (From Doc Section 3.1)
    if (cropType === 'groundnut') {
        if (descLower.includes('leaf') && descLower.includes('yellow') || descLower.includes('stunt')) {
            probablePest = "Groundnut Rosette Virus";
            confidence = 85;
            actionGuidance = "Remove affected plants immediately. Do not compost near healthy fields. Check for aphids.";
        } else if (descLower.includes('web') || descLower.includes('caterpillar')) {
            probablePest = "Leaf Webber / Caterpillar";
            confidence = 70;
            actionGuidance = "Scout leaves daily. Remove webbed clusters manually. Apply neem oil if available.";
        }
    } 
    // Tomato Fall Armyworm/Tuta Absoluta Logic
    else if (cropType === 'tomato' || cropType === 'maize') {
        if (descLower.includes('hole') || descLower.includes('larva') || descLower.includes('frass')) {
            probablePest = "Fall Armyworm / Borers";
            confidence = 60;
            actionGuidance = "Inspect whorls/stems. Handpick larvae. Consider biological control agents.";
        }
    }

    return { probablePest, confidence, actionGuidance };
}

module.exports = { analyzeSymptoms };