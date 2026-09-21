import TrainingModule from "../models/TrainingModule.js";
import User from "../models/User.js";
import Assessment from "../models/Assessment.js";

export const seedDefaultData = async () => {
  try {
    // 1. Seed Initial Admin if no admin exists
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      await User.create({
        name: "AI Safe System Admin",
        email: "admin@aisafe.org",
        password: "Admin@123456", // Will be hashed by User pre-save hook
        role: "admin",
        industry: "mining",
        preferredLanguage: "en"
      });
      console.log("[Seed] Default admin created: admin@aisafe.org / Admin@123456");
    }

    // Clean up any non-prototype modules if previously created
    await TrainingModule.deleteMany({ moduleId: { $in: ["FIRE_EXPLOSION", "GAS_LEAK"] } });
    await Assessment.deleteMany({ moduleId: { $in: ["FIRE_EXPLOSION", "GAS_LEAK"] } });

    // 2. Seed Single Prototype Training Module: SPACE_HAZARD
    const spaceHazardModule = {
      moduleId: "SPACE_HAZARD",
      title: "Confined Space & Space Hazard Safety",
      description: "AR-based industrial safety simulation for confined space entry, atmospheric testing (Oxygen deficiency, H2S, Carbon Monoxide), forced mechanical ventilation, safety harness checks, Lockout/Tagout (LOTO), and emergency egress protocols in mining, steel, and mica operations.",
      industryTypes: ["mining", "steel", "mica"],
      passingScorePercentage: 75,
      arScenarioConfig: {
        sceneName: "SpaceHazardMineLevel1",
        targetHazardsCount: 5,
        timeLimitSeconds: 300
      },
      isActive: true
    };

    const moduleExists = await TrainingModule.findOne({ moduleId: spaceHazardModule.moduleId });
    if (!moduleExists) {
      await TrainingModule.create(spaceHazardModule);
      console.log(`[Seed] Seeded module: ${spaceHazardModule.moduleId} (${spaceHazardModule.title})`);
    }

    // 3. Seed Assessment for SPACE_HAZARD (English, Hindi, and Santali localization)
    const assessmentExists = await Assessment.findOne({ moduleId: "SPACE_HAZARD" });
    if (!assessmentExists) {
      const spaceHazardAssessment = {
        moduleId: "SPACE_HAZARD",
        title: "Confined Space & Space Hazard Safety Assessment",
        passingScorePercentage: 75,
        totalPoints: 100,
        questions: [
          {
            questionId: "Q1",
            questionText: {
              en: "What is the minimum safe oxygen concentration required before entering a confined space?",
              hi: "सीमित स्थान (Confined Space) में प्रवेश करने से पहले आवश्यक न्यूनतम सुरक्षित ऑक्सीजन स्तर क्या है?",
              sat: "Confined space re bolo maṛang safe oxygen level tinạk tahēn jạrur-a?"
            },
            options: [
              {
                optionId: "A",
                text: { en: "16.0%", hi: "16.0%", sat: "16.0%" }
              },
              {
                optionId: "B",
                text: { en: "19.5%", hi: "19.5%", sat: "19.5%" }
              },
              {
                optionId: "C",
                text: { en: "23.5%", hi: "23.5%", sat: "23.5%" }
              },
              {
                optionId: "D",
                text: { en: "14.0%", hi: "14.0%", sat: "14.0%" }
              }
            ],
            correctOptionId: "B",
            explanation: "OSHA and DGMS mining regulations specify 19.5% as the minimum permissible safe oxygen concentration.",
            points: 20
          },
          {
            questionId: "Q2",
            questionText: {
              en: "In what sequence must atmospheric hazards be tested before entry into a confined space?",
              hi: "सीमित स्थान में प्रवेश से पहले वायुमंडलीय खतरों की जांच किस क्रम में की जानी चाहिए?",
              sat: "Confined space re bolo maṛang gas jãch cét sạri leka hoyo-a?"
            },
            options: [
              {
                optionId: "A",
                text: {
                  en: "Toxic gases -> Flammable gases -> Oxygen",
                  hi: "विषाक्त गैसें -> ज्वलनशील गैसें -> ऑक्सीजन",
                  sat: "Bikh gas -> Jolon gas -> Oxygen"
                }
              },
              {
                optionId: "B",
                text: {
                  en: "Oxygen content -> Flammable gases -> Toxic contaminants",
                  hi: "ऑक्सीजन सामग्री -> ज्वलनशील गैसें -> विषाक्त संदूषक",
                  sat: "Oxygen -> Jolon gas -> Bikh gas"
                }
              },
              {
                optionId: "C",
                text: {
                  en: "Flammable gases -> Toxic gases -> Oxygen",
                  hi: "ज्वलनशील गैसें -> विषाक्त गैसें -> ऑक्सीजन",
                  sat: "Jolon gas -> Bikh gas -> Oxygen"
                }
              },
              {
                optionId: "D",
                text: {
                  en: "Any order is acceptable",
                  hi: "कोई भी क्रम स्वीकार्य है",
                  sat: "Jāhān leka gey hoyo-a"
                }
              }
            ],
            correctOptionId: "B",
            explanation: "Always test Oxygen first because flammable gas sensors require sufficient oxygen to operate accurately.",
            points: 20
          },
          {
            questionId: "Q3",
            questionText: {
              en: "When must forced mechanical ventilation be maintained during confined space work?",
              hi: "सीमित स्थान में काम के दौरान यांत्रिक वेंटिलेशन (Mechanical Ventilation) कब तक चालू रहना चाहिए?",
              sat: "Hawa fan (Mechanical Ventilation) tiskhor chạlu tahēn jạrur-a?"
            },
            options: [
              {
                optionId: "A",
                text: {
                  en: "Only for 10 minutes before entry",
                  hi: "प्रवेश से पहले केवल 10 मिनट के लिए",
                  sat: "Bolo maṛang 10 minute lagid"
                }
              },
              {
                optionId: "B",
                text: {
                  en: "Only when workers feel dizzy",
                  hi: "केवल जब कामगारों को चक्कर महसूस हो",
                  sat: "Khạli jọkhon kạmi hoṛ biṛhi-a"
                }
              },
              {
                optionId: "C",
                text: {
                  en: "Continuously throughout the entire duration of the work",
                  hi: "कार्य की पूरी अवधि के दौरान लगातार",
                  sat: "Kạmi chaba dhạbić sob somoy chạlu tahēna"
                }
              },
              {
                optionId: "D",
                text: {
                  en: "Only during high temperatures",
                  hi: "केवल उच्च तापमान के समय",
                  sat: "Khạli garmi somoy"
                }
              }
            ],
            correctOptionId: "C",
            explanation: "Continuous positive forced air ventilation prevents hazardous atmospheric buildup while workers are inside.",
            points: 20
          },
          {
            questionId: "Q4",
            questionText: {
              en: "What is the primary purpose of Lockout/Tagout (LOTO) procedures prior to confined space entry?",
              hi: "सीमित स्थान में प्रवेश से पहले लॉकआउट/टैगआउट (LOTO) का मुख्य उद्देश्य क्या है?",
              sat: "Bolo maṛang Lockout/Tagout (LOTO) reakạ mukhia kạmi cét kana?"
            },
            options: [
              {
                optionId: "A",
                text: {
                  en: "To record worker attendance",
                  hi: "श्रमिकों की उपस्थिति दर्ज करना",
                  sat: "Hoṛko reakạ attendance ol lagid"
                }
              },
              {
                optionId: "B",
                text: {
                  en: "To isolate all hazardous energy sources and pipe lines",
                  hi: "सभी खतरनाक ऊर्जा स्रोतों और पाइपलाइनों को पूरी तरह अलग (Isolate) करना",
                  sat: "Khatarnaak current ar pipeline jọto bọnd doho lagid"
                }
              },
              {
                optionId: "C",
                text: {
                  en: "To lock the external gate",
                  hi: "बाहरी मुख्य गेट को बंद करना",
                  sat: "Bahar gate kulup lagid"
                }
              },
              {
                optionId: "D",
                text: {
                  en: "To test the air pressure",
                  hi: "हवा के दबाव का परीक्षण करना",
                  sat: "Hawa pressure jãch lagid"
                }
              }
            ],
            correctOptionId: "B",
            explanation: "LOTO ensures mechanical, electrical, pneumatic, and chemical sources are neutralized to prevent accidental energization.",
            points: 20
          },
          {
            questionId: "Q5",
            questionText: {
              en: "If an entrant collapses inside a confined space, what must the standby attendant do first?",
              hi: "यदि सीमित स्थान के अंदर कोई कामगार बेहोश हो जाए, तो बाहर खड़े स्टैंडबाय अटेंडेंट को सबसे पहले क्या करना चाहिए?",
              sat: "Khọnd bhitor re kạmi hoṛ bhindiṛ lenkhan, bahar re tahēn attendant maṛang cét-e kạmi-a?"
            },
            options: [
              {
                optionId: "A",
                text: {
                  en: "Immediately jump inside the space to give CPR",
                  hi: "सीपीआर देने के लिए तुरंत अंदर कूद जाना",
                  sat: "CPR em lagid lọgọn bhitor bolo-a"
                }
              },
              {
                optionId: "B",
                text: {
                  en: "Summon emergency rescue and initiate non-entry retrieval",
                  hi: "आपातकालीन बचाव दल को बुलाना और बाहर से ही हार्नेस/तार द्वारा खींचना (Non-entry retrieval)",
                  sat: "Rescue team hoho ar dori/winch te bahar khon tạkhi tạn"
                }
              },
              {
                optionId: "C",
                text: {
                  en: "Switch off the ventilation fans",
                  hi: "वेंटिलेशन पंखे बंद करना",
                  sat: "Fan bọnd doho"
                }
              },
              {
                optionId: "D",
                text: {
                  en: "Wait for shift supervisor to arrive before reacting",
                  hi: "कोई भी कार्रवाई करने से पहले शिफ्ट सुपरवाइजर का इंतजार करना",
                  sat: "Supervisor hijuk dhạbić thir tahēna"
                }
              }
            ],
            correctOptionId: "B",
            explanation: "Over 60% of confined space fatalities are would-be rescuers. The attendant must initiate non-entry rescue and summon the emergency team without entering unprotected.",
            points: 20
          }
        ]
      };

      await Assessment.create(spaceHazardAssessment);
      console.log(`[Seed] Seeded assessment for: ${spaceHazardAssessment.moduleId}`);
    }
  } catch (error) {
    console.error(`[Seed] Error seeding initial data: ${error.message}`);
  }
};
