export const translations = {
  ml: {
    nav: {
      home: "ഹോം",
      register: "രജിസ്റ്റർ",
      find: "രക്തം കണ്ടെത്തുക",
    },
    hero: {
      title: "ജീവന്റെ കൈമാറ്റം",
      subtitle: "നിങ്ങളുടെ ഒരു ചെറിയ സഹായം ഒരാളുടെ ജീവൻ രക്ഷിച്ചേക്കാം. ഞങ്ങളുടെ പഞ്ചായത്തിലെ രക്തദാതാക്കളുടെ കൂട്ടായ്മയിലേക്ക് സ്വാഗതം.",
      findBtn: "രക്തം കണ്ടെത്തുക",
      regBtn: "ദാതാവാകുക",
    },
    howItWorks: {
      title: "ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു?",
      step1: {
        title: "രജിസ്റ്റർ ചെയ്യുക",
        desc: "നിങ്ങളുടെ വിവരങ്ങൾ നൽകി ഒരു ദാതാവായി രജിസ്റ്റർ ചെയ്യുക.",
      },
      step2: {
        title: "കണ്ടെത്തുക",
        desc: "ആവശ്യമുള്ള സമയത്ത് രക്തഗ്രൂപ്പ് ഉപയോഗിച്ച് ദാതാക്കളെ തിരയുക.",
      },
      step3: {
        title: "ബന്ധപ്പെടുക",
        desc: "ദാതാവിനെ നേരിട്ട് വിളിക്കാനോ വാട്സ്ആപ്പ് ചെയ്യാനോ സാധിക്കും.",
      }
    },
    form: {
      title: "ദാതാവായി രജിസ്റ്റർ ചെയ്യുക",
      name: "പേര്",
      bloodGroup: "രക്തഗ്രൂപ്പ്",
      location: "സ്ഥലം (Location)",
      address: "പൂർണ്ണമായ വിലാസം (Address)",
      medicalConditions: "എന്തെങ്കിലും അസുഖങ്ങൾ ഉണ്ടെങ്കിൽ സൂചിപ്പിക്കുക (Medical Conditions)",
      phone: "ഫോൺ നമ്പർ",
      whatsapp: "വാട്സ്ആപ്പ് നമ്പർ",
      submit: "രജിസ്റ്റർ ചെയ്യുക",
      success: "വിജയകരമായി രജിസ്റ്റർ ചെയ്തു!",
      error: "ഒരു പിശക് സംഭവിച്ചു. വീണ്ടും ശ്രമിക്കുക.",
      lastDonation: "അവസാനം രക്തം നൽകിയ തീയതി (ഉണ്ടെങ്കിൽ)",
      availability: {
        available: "ലഭ്യമാണ്",
        onCooldown: "ലഭ്യമല്ല (വിശ്രമത്തിൽ)",
        daysRemaining: "{days} ദിവസത്തിന് ശേഷം ലഭ്യമാകും",
      }
    },
    find: {
      title: "രക്തദാതാക്കളെ കണ്ടെത്തുക",
      placeholder: "രക്തഗ്രൂപ്പ് തിരഞ്ഞെടുക്കുക",
      noResults: "ദാതാക്കളെ കണ്ടെത്താനായില്ല.",
      call: "വിളിക്കുക",
      whatsapp: "വാട്സ്ആപ്പ്",
    },
    common: {
      loading: "ശ്രമിക്കുന്നു...",
      loginWithGoogle: "ഗൂഗിൾ ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യുക",
    }
  },
  en: {
    nav: {
      home: "Home",
      register: "Register",
      find: "Find Blood",
    },
    hero: {
      title: "The Gift of Life",
      subtitle: "Your small help can save a life. Welcome to our Panchayat's blood donor community.",
      findBtn: "Find Blood",
      regBtn: "Become a Donor",
    },
    howItWorks: {
      title: "How It Works?",
      step1: {
        title: "Register",
        desc: "Register as a donor by providing your basic details.",
      },
      step2: {
        title: "Search",
        desc: "Search for donors by blood group when in need.",
      },
      step3: {
        title: "Connect",
        desc: "Directly call or WhatsApp the donor for immediate help.",
      }
    },
    form: {
      title: "Register as a Donor",
      name: "Full Name",
      bloodGroup: "Blood Group",
      location: "Location",
      address: "Full Address",
      medicalConditions: "Any Medical Conditions (if any)",
      phone: "Phone Number",
      whatsapp: "WhatsApp Number",
      submit: "Register Now",
      success: "Registered Successfully!",
      error: "Something went wrong. Please try again.",
      lastDonation: "Last Donation Date (if any)",
      availability: {
        available: "Available",
        onCooldown: "Not Available (Resting)",
        daysRemaining: "Available in {days} days",
      }
    },
    find: {
      title: "Find Blood Donors",
      placeholder: "Select Blood Group",
      noResults: "No donors found.",
      call: "Call",
      whatsapp: "WhatsApp",
    },
    common: {
      loading: "Loading...",
      loginWithGoogle: "Login with Google",
    }
  }
};

export const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
