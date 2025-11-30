/***************************************
 India Cooperative Visit Tracker - Apps Script
 Paste into Extensions → Apps Script for your Google Sheet
 ***************************************/

const STATE_DISTRICTS_JSON = `
{
"ANDAMAN & NICOBAR ISLANDS":["NICOBARS","NORTH AND MIDDLE ANDAMAN","SOUTH ANDAMAN"],
"ANDHRA PRADESH":["ANANTAPUR","CHITTOOR","CUDDAPAH","EAST GODAVARI","GUNTUR","KRISHNA","KURNOOL","NELLORE","PRAKASAM","SPSR NELLORE","SRIKAKULAM","VISAKHAPATANAM","VIZIANAGARAM","WEST GODAVARI"],
"ARUNACHAL PRADESH":["ANJAW","CHANGLANG","DIBANG VALLEY","EAST KAMENG","EAST SIANG","KURUNG KUMEY","LOHIT","LONGDING","LOWER DIBANG VALLEY","LOWER SUBANSIRI","NAMSAI","PAPUM PARE","SHI YOMI","SIANG","TAWANG","TIRAP","UPPER SIANG","UPPER SUBANSIRI","WEST KAMENG","WEST SIANG"],
"ASSAM":["BAKSA","BARPETA","BISWANATH","BONGAIGAON","CACHAR","CHARAIDEO","CHIRANG","DARRANG","DHEMAJI","DHUBRI","DIBRUGARH","DIMA HASAO","GOALPARA","GOLAGHAT","HAILAKANDI","HOJAI","JORHAT","KAMRUP","KAMRUP METRO","KARBI ANGLONG","KARIMGANJ","KOKRAJHAR","LAKHIMPUR","MAJULI","MARIGAON","NAGAON","NALBARI","SIVASAGAR","SONITPUR","TINSUKIA","UDALGURI","WEST KARBI ANGLONG"],
"BIHAR":["ARARIA","ARWAL","AURANGABAD","BANKA","BEGUSARAI","BHAGALPUR","BHOJPUR","BUXAR","DARBHANGA","EAST CHAMPARAN","GAYA","GOPALGANJ","JAMUI","JEHANABAD","KAIMUR","KATIHAR","KHAGARIA","KISHANGANJ","LAKHISARAI","MADHEPURA","MADHUBANI","MUNGER","MUZAFFARPUR","NALANDA","NAWADA","PASHCHIM CHAMPARAN","PATNA","PURBI CHAMPARAN","PURNIA","ROHTAS","SAHARSA","SAMASTIPUR","SARAN","SHEIKHPURA","SHEOHAR","SITAMARHI","SIWAN","SUPAUL","VAISHALI"],
"CHANDIGARH":["CHANDIGARH"],
"CHHATTISGARH":["BALOD","BALODA BAZAR","BALRAMPUR","BASTAR","BEMETARA","BIJAPUR","BILASPUR","DANTEWADA","DHAMTARI","DURG","GARIABAND","JANJGIR-CHAMPA","JASHPUR","KABIRDHAM","KANKER","KONDAGAON","KORBA","KOREA","MAHASAMUND","MUNGELI","NARAYANPUR","RAIGARH","RAIPUR","RAJNANDGAON","SUKMA","SURAJPUR","SURGUJA"],
"DADRA AND NAGAR HAVELI":["DADRA AND NAGAR HAVELI"],
"DAMAN AND DIU":["DAMAN","DIU"],
"DELHI":["CENTRAL DELHI","EAST DELHI","NEW DELHI","NORTH DELHI","NORTH EAST DELHI","NORTH WEST DELHI","SHAHDARA","SOUTH DELHI","SOUTH EAST DELHI","SOUTH WEST DELHI","WEST DELHI"],
"GOA":["NORTH GOA","SOUTH GOA"],
"GUJARAT":["AHMEDABAD","AMRELI","ANAND","ARAVALLI","BANASKANTHA","BHARUCH","BHAVNAGAR","BOTAD","CHHOTAUDEPUR","DAHOD","DANG","DEVBHUMI DWARKA","GANDHINAGAR","GIR SOMNATH","JAMNAGAR","JUNAGADH","KACHCHH","KHEDA","MAHISAGAR","MEHSANA","MORBI","NARMADA","NAVSARI","PANCHMAHALS","PATAN","PORBANDAR","RAJKOT","SABARKANTHA","SURAT","SURENDRANAGAR","TAPI","VADODARA","VALSAD"],
"HARYANA":["AMBALA","BHIWANI","CHARKHI DADRI","FARIDABAD","FATEHABAD","GURUGRAM","HISAR","JHAJJAR","JIND","KAITHAL","KARNAL","KURUKSHETRA","MAHENDRAGARH","NUH","PALWAL","PANCHKULA","PANIPAT","REWARI","ROHTAK","SIRSA","SONIPAT","YAMUNANAGAR"],
"HIMACHAL PRADESH":["BILASPUR","CHAMBA","HAMIRPUR","KANGRA","KINNAUR","KULLU","LAHAUL AND SPITI","MANDI","SHIMLA","SIRMAUR","SOLAN","UNA"],
"JAMMU AND KASHMIR":["ANANTNAG","BANDIPORA","BARAMULLA","BUDGAM","DODA","GANDERBAL","JAMMU","KATHUA","KISHTWAR","KULGAM","KUPWARA","POONCH","PULWAMA","RAJOURI","RAMBAN","REASI","SAMBA","SHOPIAN","SRINAGAR","UDHAMPUR"],
"JHARKHAND":["BOKARO","CHATRA","DEOGHAR","DHANBAD","DUMKA","EAST SINGHBHUM","GARHWA","GIRIDIH","GODDA","GUMLA","HAZARIBAGH","JAMTARA","KHUNTI","KODERMA","LATEHAR","LOHARDAGA","PAKUR","PALAMU","RAMGARH","RANCHI","SAHEBGANJ","SARAIKELA-KHARSAWAN","SIMDEGA","WEST SINGHBHUM"],
"KARNATAKA":["BAGALKOT","BALLARI","BELAGAVI","BENGALURU RURAL","BENGALURU URBAN","BIDAR","CHAMARAJANAGAR","CHIKKABALLAPUR","CHIKKAMAGALURU","CHITRADURGA","DAKSHINA KANNADA","DAVANGERE","DHARWAD","GADAG","HASSAN","HAVERI","KALABURAGI","KODAGU","KOLAR","KOPPAL","MANDYA","MYSURU","RAICHUR","RAMANAGARA","SHIVAMOGGA","TUMAKURU","UDUPI","UTTARA KANNADA","VIJAYAPURA","YADGIR"],
"KERALA":["ALAPPUZHA","ERNAKULAM","IDUKKI","KANNUR","KASARAGOD","KOLLAM","KOTTAYAM","KOZHIKODE","MALAPPURAM","PALAKKAD","PATHANAMTHITTA","THIRUVANANTHAPURAM","THRISSUR","WAYANAD"],
"LADAKH":["KARGIL","LEH LADAKH"],
"LAKSHADWEEP":["LAKSHADWEEP"],
"MADHYA PRADESH":["AGAR MALWA","ALIRAJPUR","ANUPPUR","ASHOKNAGAR","BALAGHAT","BARWANI","BETUL","BHIND","BHOPAL","BURHANPUR","CHHATARPUR","CHHINDWARA","DAMOH","DATIA","DEWAS","DHAR","DINDORI","GUNA","GWALIOR","HARDA","HOSHANGABAD","INDORE","JABALPUR","JHABUA","KATNI","KHANDWA","KHARGONE","MANDLA","MANDSAUR","MORENA","NARSINGHPUR","NEEMUCH","PANNA","RAISEN","RAJGARH","RATLAM","REWA","SAGAR","SATNA","SEHORE","SEONI","SHAHDOL","SHAJAPUR","SHEOPUR","SHIVPURI","SIDHI","SINGRAULI","TIKAMGARH","UJJAIN","UMARIA","VIDISHA"],
"MAHARASHTRA":["AHMEDNAGAR","AKOLA","AMRAVATI","AURANGABAD","BEED","BHANDARA","BULDHANA","CHANDRAPUR","DHULE","GADCHIROLI","GONDIA","HINGOLI","JALGAON","JALNA","KOLHAPUR","LATUR","MUMBAI","MUMBAI SUBURBAN","NAGPUR","NANDED","NANDURBAR","NASHIK","OSMANABAD","PALGHAR","PARBHANI","PUNE","RAIGAD","RATNAGIRI","SANGLI","SATARA","SINDHUDURG","SOLAPUR","THANE","WARDHA","WASHIM","YAVATMAL"],
"MANIPUR":["BISHNUPUR","CHANDEL","CHURACHANDPUR","IMPHAL EAST","IMPHAL WEST","JIRIBAM","KAKCHING","KAMJONG","KANGPOKPI","NONEY","PHERZAWL","SENAPATI","TAMENGLONG","TENGNOUPAL","THOUBAL","UKHRUL"],
"MEGHALAYA":["EAST GARO HILLS","EAST JAINTIA HILLS","EAST KHASI HILLS","NORTH GARO HILLS","RI BHOI","SOUTH GARO HILLS","SOUTH WEST GARO HILLS","SOUTH WEST KHASI HILLS","WEST GARO HILLS","WEST JAINTIA HILLS","WEST KHASI HILLS"],
"MIZORAM":["AIZAWL","CHANHPHAI","DARKHUL","KHAWZAWL","KOLASIB","LAWNGTLAI","LUNGLEI","MAMIT","SAITUAL","SERCHHIP"],
"NAGALAND":["DIMAPUR","KIPHIRE","KOHIMA","LONGLENG","MOKOKCHUNG","MON","PEREN","PHEK","TUENSANG","WOKHA","ZUNHEBOTO"],
"ODISHA":["ANGUL","BALANGIR","BALESHWAR","BARGARH","BHADRAK","BOUDH","CUTTACK","DEOGARH","DHENKANAL","GAJAPATI","GANJAM","JAGATSINGHPUR","JAJPUR","JHARSUGUDA","KALAHANDI","KANDHAMAL","KENDRAPARA","KEONJHAR","KHORDHA","KORAPUT","MALKANGIRI","MAYURBHANJ","NABARANGPUR","NAYAGARH","NUAPADA","PURI","RAYAGADA","SAMBALPUR","SONEPUR","SUNDARGARH"],
"PUDUCHERRY":["KARAIKAL","MAHE","PUDUCHERRY","YANAM"],
"PUNJAB":["AMRITSAR","BARNALA","BATHINDA","FARIDKOT","FATEHGARH SAHIB","FAZILKA","FIROZPUR","GURDASPUR","HOSHIARPUR","JALANDHAR","KAPURTHALA","LUDHIANA","MANSA","MOGA","NAWANSHAHR","PATHANKOT","PATIALA","RUPNAGAR","SANGRUR","SAS NAGAR","SRI MUKTSAR SAHIB","TARN TARAN"],
"RAJASTHAN":["AJMER","ALWAR","BANSWARA","BARAN","BARMER","BHARATPUR","BHILWARA","BIKANER","BUNDI","CHITTORGARH","CHURU","DAUSA","DHOLPUR","DUNGARPUR","HANUMANGARH","JAIPUR","JAISALMER","JALORE","JHALAWAR","JHUNJHUNU","JODHPUR","KARAULI","KOTA","NAGAUR","PALI","PRATAPGARH","RAJSAMAND","SAWAI MADHOPUR","SIKAR","SIROHI","SRIGANGANAGAR","TONK","UDAIPUR"],
"SIKKIM":["EAST SIKKIM","NORTH SIKKIM","SOUTH SIKKIM","WEST SIKKIM"],
"TAMIL NADU":["ARIYALUR","CHENGALPATTU","CHENNAI","COIMBATORE","CUDDALORE","DHARMAPURI","DINDIGUL","ERODE","KALLAKURICHI","KANCHEEPURAM","KANYAKUMARI","KARUR","KRISHNAGIRI","MADURAI","MAYILADUTHURAI","NAMAKKAL","NILGIRIS","PERAMBALUR","PUDUKKOTTAI","RANIPET","RAMANATHAPURAM","SALEM","SIVAGANGA","TENKASI","THANJAVUR","THENI","THIRUVALLUR","THIRUVARUR","THOOTHUKUDI","TIRUCHIRAPPALLI","TIRUNELVELI","TIRUPPUR","TIRUVANNAMALAI","TIRUVARUR","VELLORE","VILUPPURAM","VIRUDHUNAGAR"],
"TELANGANA":["ADILABAD","BHADRADRI KOTHAGUDEM","HYDERABAD","JAGTIAL","JANGOAN","JAYASHANKAR BHUPALPALLY","JOGULAMBA GADWAL","KAMAREDDY","KARIMNAGAR","KHAMMAM","KOMARAM BHEEM","MAHABUBABAD","MAHABUBNAGAR","MANCHERIAL","MEDAK","MEDCHAL-MALKAJGIRI","MULUGU","NAGARKURNOOL","NALGONDA","NARAYANPET","NIRMAL","NIZAMABAD","PEDDAPALLI","RAJANNA SIRCILLA","RANGAREDDY","SANGAREDDY","SIDDIPET","SURYAPET","VIKARABAD","WANAPARTHY","WARANGAL RURAL","WARANGAL URBAN","YADADRI BHUVANAGIRI"],
"TRIPURA":["DHALAI","GOMATI","KHOWAI","NORTH TRIPURA","SEPAHIJALA","SOUTH TRIPURA","UNAKOTI","WEST TRIPURA"],
"UTTAR PRADESH":["AGRA","ALIGARH","ALLAHABAD","AMBEDKAR NAGAR","AMETHI","AMROHA","AURAIYA","AZAMGARH","BAGHPAT","BAHRAICH","BALLIA","BALRAMPUR","BANDA","BARABANKI","BAREILLY","BASTI","BHADOHI","BIJNOR","BUDAUN","BULANDSHAHR","CHANDAULI","CHITRAKOOT","DEORIA","ETAH","ETAWAH","FAIZABAD","FARRUKHABAD","FATEHPUR","FIROZABAD","GAUTAM BUDDHA NAGAR","GHAZIABAD","GHAZIPUR","GONDA","GORAKHPUR","HAMIRPUR","HAPUR","HARDOI","HATHRAS","JALAUN","JAUNPUR","JHANSI","KANNAUJ","KANPUR DEHAT","KANPUR NAGAR","KASGANJ","KAUSHAMBI","KHERI","KUSHI NAGAR","LALITPUR","LUCKNOW","MAHARAJGANJ","MAHOBA","MAINPURI","MATHURA","MAU","MEERUT","MIRZAPUR","MORADABAD","MUZAFFARNAGAR","PILIBHIT","PRATAPGARH","RAE BARELI","RAMPUR","SAHARANPUR","SAMBHAL","SANT KABEER NAGAR","SHAHJAHANPUR","SHAMLI","SHRAVASTI","SIDDHARTHNAGAR","SITAPUR","SONBHADRA","SULTANPUR","UNNAO","VARANASI"],
"UTTARAKHAND":["ALMORA","BAGESHWAR","CHAMOLI","CHAMPAWAT","DEHRADUN","HARIDWAR","NAINITAL","PAURI GARHWAL","PITHORAGARH","RUDRAPRAYAG","TEHRI GARHWAL","UDHAM SINGH NAGAR","UTTARKASHI"],
"WEST BENGAL":["ALIPURDUAR","BANKURA","BIRBHUM","COOCH BEHAR","DAKSHIN DINAJPUR","DARJEELING","HOOGHLY","HOWRAH","JALPAIGURI","JHARGRAM","KALIMPONG","KOLKATA","MALDA","MURSHIDABAD","NADIA","NORTH 24 PARGANAS","PASCHIM BARDHAMAN","PASCHIM MEDINIPUR","PURBA BARDHAMAN","PURBA MEDINIPUR","PURULIA","SOUTH 24 PARGANAS","UTTAR DINAJPUR"]
}

`;

/* =================== CONFIGURATION =================== */
// Edit these before use:
const CONFIG = {
  VISITS_SHEET_NAME: "Visits",         // main sheet where data lands
  STATE_SHEET_PREFIX: "",             // prefix for created state sheets (optional)
  EMAIL_RECIPIENTS: ["youremail@domain.com"], // array of emails to receive reminders/alerts
  REMINDER_DAYS_AHEAD: 1,             // how many days ahead to remind (1 = tomorrow)
  TIMEZONE: "Asia/Kolkata",           // use your timezone
  CREATE_STATE_SHEETS: true,          // set false if you already created state sheets
  PROTECT_STATE_SHEETS: false         // protection requires domain-level accounts; leave false unless using Workspace
};

/* Master header row - must match exactly the Visits sheet headers */
const HEADERS = [
  "State", "Division/Region", "District", "Taluk/Block", "Employee Name", "Employee ID",
  "Date of Visit", "Co-operative Society / Bank Name", "Type (Society/Bank)",
  "Address", "Contact Person", "Contact Number", "Purpose of Visit",
  "Discussion Summary", "Documents Collected", "Next Follow-up Date",
  "Status (Pending/Completed)", "Remarks"
];

/* Official list of Indian States/UTs used when creating form/state sheets */
const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Puducherry","Jammu & Kashmir","Ladakh"
];

/* =================== UTILITIES =================== */
function getSheetByNameSafe(name) {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function findHeaderIndex(sheet, headerName) {
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  for (let i=0;i<headers.length;i++) {
    if (String(headers[i]).trim() === headerName) return i+1; // 1-based
  }
  return -1;
}

/* =================== SETUP HELPERS =================== */

/**
 * createStateSheets()
 * Create sheets for all STATES with the standard headers in row 1.
 * Run once to create the state sheets.
 */
function createStateSheets() {
  const ss = SpreadsheetApp.getActive();
  if (!CONFIG.CREATE_STATE_SHEETS) {
    Logger.log("CONFIG.CREATE_STATE_SHEETS is false — skipping creation.");
    return;
  }
  STATES.forEach(function(st) {
    const sheetName = (CONFIG.STATE_SHEET_PREFIX || "") + st;
    if (!ss.getSheetByName(sheetName)) {
      const sht = ss.insertSheet(sheetName);
      sht.setTabColor("#d9eaf7");
      // write headers
      sht.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
      // small instruction note
      sht.getRange(2,1).setValue("This sheet is for reference. Use FILTER in Google Sheets to auto-populate, or rely on the autoCopyToStateSheets function.");
    } else {
      Logger.log("Sheet exists: " + sheetName);
    }
  });
  // Optionally protect sheets (Workspace only)
  if (CONFIG.PROTECT_STATE_SHEETS) {
    protectStateSheets();
  }
}

/**
 * protectStateSheets() - optional, only works well on Google Workspace domains.
 * You will need to edit allowed editors below; by default it protects for owner only.
 */
function protectStateSheets() {
  const ss = SpreadsheetApp.getActive();
  const me = Session.getEffectiveUser().getEmail();
  STATES.forEach(function(st) {
    const sheetName = (CONFIG.STATE_SHEET_PREFIX || "") + st;
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    const protection = sheet.protect().setDescription("Protected sheet for " + st);
    protection.removeEditors(protection.getEditors());
    // Allow the owner (you) to edit:
    protection.addEditor(me);
    if (protection.canDomainEdit()) protection.setDomainEdit(false);
  });
}

/* =================== FORM CREATION =================== */

/**
 * createLinkedForm()
 * Creates a Google Form and links responses to this spreadsheet.
 * Run once. It will create a Form and set its destination to this spreadsheet.
 */
function createLinkedForm() {
  const ss = SpreadsheetApp.getActive();
  const form = FormApp.create(ss.getName() + " - Visit Entry Form");
  form.setDescription("Use this form to submit Co-operative / Bank visit details.");
  // Build form from HEADERS
  HEADERS.forEach(function(h) {
    if (h.indexOf("Date") !== -1) {
      form.addDateItem().setTitle(h);
    } else if (h.indexOf("Contact Number") !== -1) {
      form.addTextItem().setTitle(h).setHelpText("Enter phone or WhatsApp number");
    } else if (h.indexOf("Status") !== -1) {
      form.addMultipleChoiceItem().setTitle(h).setChoiceValues(["Pending","Completed"]).showOtherOption(false);
    } else if (h.indexOf("Type") !== -1) {
      form.addMultipleChoiceItem().setTitle(h).setChoiceValues(["Co-operative Society","Urban Co-operative Bank","Credit Cooperative","Other"]).showOtherOption(true);
    } else if (h === "State") {
      const item = form.addListItem();
      item.setTitle("State").setChoiceValues(STATES);
    } else {
      form.addTextItem().setTitle(h);
    }
  });
  // Link the form to the spreadsheet (will create a new sheet 'Form Responses 1')
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.getUi().alert("Form created and linked. Form URL: " + form.getEditUrl());
  Logger.log("Form created: " + form.getEditUrl());
}

/* =================== ON FORM SUBMIT =================== */

/**
 * onFormSubmit(e)
 * If using Google Form responses, set default values and normalize incoming rows.
 * Install via Trigger: From spreadsheet -> On form submit
 */
function onFormSubmit(e) {
  try {
    const ss = SpreadsheetApp.getActive();
    const visits = ss.getSheetByName(CONFIG.VISITS_SHEET_NAME);
    if (!visits) return;
    // If form responses are going to a Responses sheet, copy last row into Visits
    // Many users link form responses to the spreadsheet and want data in Visits sheet.
    // Here we try to be flexible: find the form responses sheet via e.source and move row.
    if (!e) return;
    const respSheet = e.range.getSheet();
    const respRangeRow = e.range.getRow();
    const respValues = respSheet.getRange(respRangeRow,1,1,respSheet.getLastColumn()).getValues()[0];

    // Map form responses to Visits columns — simple approach: append values in order
    // If form was built exactly from HEADERS, we can append directly:
    visits.appendRow(respValues);
    // Ensure Status is set
    const statusIdx = findHeaderIndex(visits, "Status (Pending/Completed)");
    const lastRow = visits.getLastRow();
    if (statusIdx > 0) {
      const stCell = visits.getRange(lastRow, statusIdx);
      if (!stCell.getValue()) stCell.setValue("Pending");
    }
  } catch (err) {
    Logger.log("onFormSubmit error: " + err);
  }
}

/* =================== AUTO COPY TO STATE SHEETS =================== */

/**
 * autoCopyToStateSheets(e)
 * Copies newly added rows in Visits to their State sheet.
 * Install as On change (or run programmatically). This avoids FILTER() if you prefer copies.
 * NOTE: keep idempotency in mind; this checks for a marker column to avoid duplicate copies.
 */
function autoCopyToStateSheets(e) {
  const ss = SpreadsheetApp.getActive();
  const visits = ss.getSheetByName(CONFIG.VISITS_SHEET_NAME);
  if (!visits) return;
  const dataRange = visits.getDataRange();
  const data = dataRange.getValues();
  const header = data[0];
  const stateIdx = header.indexOf("State");
  if (stateIdx < 0) return;

  // We'll use an internal helper column "CopiedToState" at the far right to mark processed rows
  const copyFlagHeader = "CopiedToState";
  let copyFlagIdx = header.indexOf(copyFlagHeader);
  if (copyFlagIdx === -1) {
    // create flag column
    visits.getRange(1, header.length+1).setValue(copyFlagHeader);
    copyFlagIdx = header.length; // zero-based index
  }

  // Refresh data and header length after potential change
  const lastCol = visits.getLastColumn();
  const newData = visits.getRange(2,1,visits.getLastRow()-1,lastCol).getValues();

  newData.forEach(function(row, i) {
    const state = row[stateIdx];
    const copiedFlag = row[copyFlagIdx] || "";
    if (state && copiedFlag !== "YES") {
      // find target sheet
      const targetName = (CONFIG.STATE_SHEET_PREFIX || "") + String(state);
      let target = ss.getSheetByName(targetName);
      if (!target) {
        // Create if missing (optional)
        target = ss.insertSheet(targetName);
        target.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
      }
      // Append the row (only the number of header columns)
      const rowToWrite = row.slice(0, HEADERS.length);
      target.appendRow(rowToWrite);
      // Mark as copied
      const sheetRow = i + 2; // data rows start at row 2
      visits.getRange(sheetRow, copyFlagIdx+1).setValue("YES");
    }
  });
}

/* =================== DAILY FOLLOW-UP REMINDERS =================== */

/**
 * dailyFollowUpReminder()
 * Scans Visits sheet and emails reminders for follow-ups due within REMINDER_DAYS_AHEAD or overdue
 * Install as Time-driven trigger (daily).
 */
function dailyFollowUpReminder() {
  const ss = SpreadsheetApp.getActive();
  const visits = ss.getSheetByName(CONFIG.VISITS_SHEET_NAME);
  if (!visits) return;
  const data = visits.getDataRange().getValues();
  if (data.length < 2) return;
  const headers = data[0];
  const nextFollowIdx = headers.indexOf("Next Follow-up Date");
  const statusIdx = headers.indexOf("Status (Pending/Completed)");
  const empIdx = headers.indexOf("Employee Name");
  const districtIdx = headers.indexOf("District");
  const socIdx = headers.indexOf("Co-operative Society / Bank Name");
  if (nextFollowIdx < 0 || statusIdx < 0) return;

  const today = new Date();
  const lines = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const nextDate = row[nextFollowIdx];
    const status = row[statusIdx];
    if (nextDate instanceof Date && status === "Pending") {
      // date-only comparison
      const nd = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
      const td = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const daysDiff = Math.round((nd - td)/(1000*60*60*24));
      if (daysDiff <= CONFIG.REMINDER_DAYS_AHEAD) {
        lines.push("Employee: " + (row[empIdx] || "") + " | District: " + (row[districtIdx] || "") +
                   " | Society: " + (row[socIdx] || "") + " | Next Follow-up: " + nextDate.toLocaleDateString());
      }
    }
  }

  if (lines.length > 0) {
    const subject = "Visit follow-up reminders (due soon or overdue)";
    const body = lines.join("\n\n");
    // send to configured recipients
    CONFIG.EMAIL_RECIPIENTS.forEach(function(email) {
      MailApp.sendEmail(email, subject, body);
    });
  }
}

/* =================== STATUS CHANGE ALERT =================== */

/**
 * statusChangeAlert(e)
 * Installable onEdit trigger recommended.
 * When the Status column for a row becomes "Completed", an email is sent.
 */
function statusChangeAlert(e) {
  try {
    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName(CONFIG.VISITS_SHEET_NAME);
    if (!sheet || !e) return;
    if (e.range.getSheet().getName() !== CONFIG.VISITS_SHEET_NAME) return;
    const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
    const statusCol = headers.indexOf("Status (Pending/Completed)") + 1;
    if (statusCol < 1) return;
    const row = e.range.getRow();
    if (e.range.getColumn() === statusCol && row > 1) {
      const newVal = e.range.getValue();
      if (newVal === "Completed") {
        const employee = sheet.getRange(row, headers.indexOf("Employee Name")+1).getValue();
        const contact = sheet.getRange(row, headers.indexOf("Contact Number")+1).getValue();
        const soc = sheet.getRange(row, headers.indexOf("Co-operative Society / Bank Name")+1).getValue();
        const subject = "Visit completed: " + soc;
        const body = "Employee: " + employee + "\nContact: " + contact + "\nSoc/Bank: " + soc + "\nRow: " + row;
        CONFIG.EMAIL_RECIPIENTS.forEach(function(email) {
          MailApp.sendEmail(email, subject, body);
        });
      }
    }
  } catch (err) {
    Logger.log("statusChangeAlert error: " + err);
  }
}

/* =================== MIGRATION HELPER =================== */

/**
 * importFormResponsesToVisits()
 * If form responses are in a separate sheet "Form Responses 1", this function copies them over to Visits
 * Run once if needed to migrate historical responses.
 */
function importFormResponsesToVisits() {
  const ss = SpreadsheetApp.getActive();
  const respSheet = ss.getSheetByName("Form Responses 1");
  const visits = getSheetByNameSafe(CONFIG.VISITS_SHEET_NAME);
  if (!respSheet) return;
  const data = respSheet.getDataRange().getValues();
  // Assumes headers match; skip header row
  for (let i = 1; i < data.length; i++) {
    visits.appendRow(data[i]);
  }
  // Optionally clear respSheet after copy
  // respSheet.clearContents();
}
function doGet(e) {
  const page = e.parameter.page || "home";
  let template;

  switch(page) {
    case "dashboard": 
      template = HtmlService.createTemplateFromFile("Dashboard"); 
      break;
    case "form": 
      template = HtmlService.createTemplateFromFile("Form"); 
      break;
    case "filtered": 
      template = HtmlService.createTemplateFromFile("FilteredData"); 
      break;
    case "submit": 
      template = HtmlService.createTemplateFromFile("SubmitForm"); 
      break;
    case "portal": 
      template = HtmlService.createTemplateFromFile("EmployeePortal"); 
      break;
    case "addEmployee": 
      template = HtmlService.createTemplateFromFile("AddEmployee"); 
      break;
    default: 
      template = HtmlService.createTemplateFromFile("Home");
  }

  // Pass webApp URL and current user's email if logged in
  template.webAppUrl = ScriptApp.getService().getUrl();

  // Optional: Pass current user info if you want to restrict AddEmployee button visibility
  if (page !== "addEmployee") {
    template.currentUserEmail = Session.getActiveUser().getEmail();
  }

  return template.evaluate().setTitle("India Cooperative Visit Tracker");
}


/* ========= Page Renderers ========= */

function showDashboard() {
  return HtmlService.createHtmlOutputFromFile("Dashboard")
      .setTitle("Visit Tracker Dashboard");
}

function showForm() {
  return HtmlService.createHtmlOutputFromFile("Form")
      .setTitle("Visit Entry Form");
}

function showFilteredData() {
  return HtmlService.createHtmlOutputFromFile("FilteredData")
      .setTitle("Filtered Visits Data");
}

function showSubmitForm() {
  return HtmlService.createHtmlOutputFromFile("SubmitForm")
      .setTitle("Submit Visit Data");
}

function showEmployeePortal() {
  return HtmlService.createHtmlOutputFromFile("EmployeePortal")
      .setTitle("Employee Portal");
}

/* ========= Server-side Utilities ========= */

function getVisitsData() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName("Visits");
  if (!sheet) return [];
  return sheet.getDataRange().getValues();
}
function submitVisitData(rowData) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName("Visits");
  if (!sheet) return false;

  // Add headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "State",
      "Division",
      "District",
      "Taluk",
      "Employee Name",
      "Employee ID",
      "Date of Visit",
      "Society/Bank Name",
      "Type",
      "Address",
      "Contact Person",
      "Contact Number",
      "Purpose",
      "Discussion Summary",
      "Documents Collected",
      "Next Follow-up Date",
      "Status",
      "Remarks"
    ]);
  }

  // Append the submitted data
  sheet.appendRow(rowData);
  return true;
}


/* Add more functions here as needed, e.g., filtered queries, dashboard metrics, portal login */


function getDashboardData() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName("Visits");
  if(!sheet) return { rawData: [] };

  const data = sheet.getDataRange().getValues();
  if(data.length<2) return { rawData: data };

  const headers = data[0];
  const stateIdx = headers.indexOf("State");
  const statusIdx = headers.indexOf("Status (Pending/Completed)");

  const summary = {
    totalVisits: data.length - 1,
    visitsByState: {},
    visitsByStatus: { Pending:0, Completed:0 },
    rawData: data // <-- for client-side filtering
  };

  for(let i=1;i<data.length;i++){
    const state = data[i][stateIdx] || "Unknown";
    const status = data[i][statusIdx] || "Pending";

    summary.visitsByState[state] = (summary.visitsByState[state]||0)+1;
    summary.visitsByStatus[status] = (summary.visitsByStatus[status]||0)+1;
  }

  return summary;
}

function getFilteredData(state, division, district, empEmail, status, startDate, endDate) {
  const sh = SpreadsheetApp.getActive().getSheetByName("Visits");
  const data = sh.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const rows = data.slice(1);

  console.log("---- FILTER CALL ----");
  console.log("State:", state);
  console.log("Division:", division);
  console.log("District:", district);
  console.log("Employee:", empEmail);
  console.log("Status:", status);
  console.log("Start:", startDate);
  console.log("End:", endDate);

  console.log("HEADERS:", headers);

  const col = {
  state: headers.indexOf("state"),
  division: headers.indexOf("division"),
  district: headers.indexOf("district"),
  empEmail: headers.indexOf("employee id"), // match your sheet
  status: headers.indexOf("status"),
  date: headers.indexOf("date of visit"),
};

  console.log("COLUMN INDEXES:", col);

  // Detect missing columns
  for (let key in col) {
    if (col[key] === -1) {
      console.error("❌ MISSING COLUMN:", key);
    }
  }

  const result = rows.filter(r => {
    const rowState = r[col.state] || "";
    const rowDivision = r[col.division] || "";
    const rowDistrict = r[col.district] || "";
    const rowEmp = r[col.empEmail] || "";
    const rowStatus = r[col.status] || "";
    const rowDate = r[col.date] ? new Date(r[col.date]) : null;

    // LOG first 5 rows only
    if (Math.random() < 0.02) {
      console.log("ROW CHECK:", rowState, rowDivision, rowDistrict, rowEmp, rowStatus, rowDate);
    }

    if (state !== "" && rowState !== state) return false;
    if (state !== "" && division !== "" && rowDivision !== division) return false;
    if (division !== "" && district !== "" && rowDistrict !== district) return false;
    if (empEmail !== "" && rowEmp !== empEmail) return false;
    if (status !== "" && rowStatus !== status) return false;
    if (startDate !== "" && (!rowDate || rowDate < new Date(startDate))) return false;
    if (endDate !== "" && (!rowDate || rowDate > new Date(endDate))) return false;

    return true;
  });

  console.log("ROWS RETURNED:", result.length);

  return [headers].concat(result);
}

/**
 * Returns unique dropdown values for filters
 */
function getFilterDropdownData() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Visits");
  const raw = sheet.getDataRange().getValues();

  Logger.log("Dropdown data called. Total rows: " + raw.length);

  if (!raw || raw.length < 2) {
    Logger.log("No data found in sheet");
    return {};
  }

  const headers = raw[0].map(h => String(h).trim().toLowerCase());
  const rows = raw.slice(1);

  Logger.log("Headers: " + JSON.stringify(headers));

  const idx = {
    state: headers.indexOf("state"),
    district: headers.indexOf("district"),
    employee: headers.indexOf("employee name") >= 0 ? headers.indexOf("employee name") : headers.indexOf("employee"),
    type: headers.indexOf("type"),
    status: headers.indexOf("status")
  };

  Logger.log("Column Index Map: " + JSON.stringify(idx));

  const statesSet = new Set();
  const stateDistricts = {};
  const employeesSet = new Set();
  const typesSet = new Set();

  rows.forEach(r => {
    const state = r[idx.state];
    const district = r[idx.district];
    const emp = r[idx.employee];
    const type = r[idx.type];

    if (state) statesSet.add(state);
    if (emp) employeesSet.add(emp);
    if (type) typesSet.add(type);

    if (state) {
      if (!stateDistricts[state]) stateDistricts[state] = [];
      if (district && !stateDistricts[state].includes(district))
        stateDistricts[state].push(district);
    }
  });

  Logger.log("Employees collected: " + JSON.stringify([...employeesSet]));

  return {
    states: [...statesSet],
    stateDistricts: stateDistricts,
    employees: [...employeesSet],
    types: [...typesSet],
    status: ["Pending", "Completed"]
  };
}



// Normalize values
function normalize(v) {
  if (!v) return "";
  return String(v).trim().toLowerCase();
}


function parseFlexibleDate(s) {
  if (!s) return null;
  if (s instanceof Date) return s;

  s = String(s).trim();
  const parts = s.split('/');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts.map(Number);
    return new Date(yyyy, mm - 1, dd);
  }

  const d = new Date(s);
  return isNaN(d) ? null : d;
}





const USERS = [
  {email:"manager@domain.com", role:"Manager"},
  {email:"staff@domain.com", role:"Staff"}
];

function checkUser(email) {
  const user = USERS.find(u=>u.email===email);
  return user ? user.role : null;
}

function getWebAppUrl() {
  // Returns the currently deployed web app URL
  return ScriptApp.getService().getUrl();
}

function getLocationData() {
  try {
    return JSON.parse(STATE_DISTRICTS_JSON);
  } catch (err) {
    Logger.log("Error parsing embedded location JSON: " + err);
    return {};
  }
}

// returns taluks object for the requested state (string). For Karnataka, the key is "Karnataka".
function getTaluksForState(state) {
  try {
    if (!state) return {};
    state = String(state).trim();
    // add more states here as you paste them in, e.g. TALUK_DATA_MAHARASHTRA, etc.
    if (state === "Karnataka" || state === "Karnataka".toUpperCase() || state === "Karnataka".toLowerCase()) {
      return TALUK_DATA_KARNATAKA;
    }
    // fallback: if a global TALUK_DATA object exists that contains all states (not recommended due to size), return that.
    if (typeof TALUK_DATA !== "undefined" && TALUK_DATA[state]) return TALUK_DATA[state];
    return {};
  } catch (err) {
    Logger.log("getTaluksForState error: " + err);
    return {};
  }
}


// Allowed users with roles
const allowedUsers = {
  "conetx.notifications@gmail.com": "Admin",
  "babuashwath94@gmail.com": "Employee",
  "alex@example.com": "Employee"
};

// Check role of a user
function checkUser(email) {
  if (!email) return null;
  email = email.trim().toLowerCase();
  return allowedUsers[email] || null;
}

// Return all allowed employees
function getEmployeeList() {
  return Object.keys(allowedUsers);
}


// Code.gs

const EMPLOYEE_SHEET = "Employee";

// Fetch all employees as allowedUsers object
function getAllowedUsers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EMPLOYEE_SHEET);
  const data = sheet.getDataRange().getValues();
  let users = {};
  for (let i = 1; i < data.length; i++) { // skip header
    const [email, name, role, code] = data[i];
    if (email) {
      users[email.toLowerCase()] = { name, role, code };
    }
  }
  return users;
}


// Get logged in user email (Google login)
function getCurrentUserEmail() {
  const email = Session.getActiveUser().getEmail();
  return email;
}

// Check user role by email (used for fallback manual login if needed)
function checkUser(email) {
  const users = getAllowedUsers();
  return users[email.toLowerCase()] ? users[email.toLowerCase()] : null;
}

// Submit visit data (example: store in another sheet)
function submitVisitData(row) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Visits");
  if (!sheet) {
    const newSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Visits");
    newSheet.appendRow(["State","Division","District","Taluk","Employee Email","Employee Code","Date","Society/Bank","Type","Address","Contact Person","Contact Number","Purpose","Summary","Documents","Next Follow","Status","Remarks"]);
  }
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Visits").appendRow(row);
  return true;
}

// Fetch all visits
function getAllVisits() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Visits");
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  return data.slice(1); // skip header
}

// Location data (optional)
function getLocationData() {
  return {
    "Karnataka": ["Bengaluru Urban","Bengaluru Rural","Mysuru","Mysore","Chikkamagaluru"],
    "Maharashtra": ["Pune","Mumbai","Nagpur"]
  };
}


// Get all employees
function getEmployees() {
  const ss = SpreadsheetApp.getActive();
  Logger.log("Active spreadsheet: %s", ss.getName());

  const sheet = ss.getSheetByName("Employees");
  if (!sheet) {
    Logger.log("Sheet 'Employees' not found.");
    return [];
  }
  Logger.log("Found sheet: %s", sheet.getName());

  const data = sheet.getDataRange().getValues();
  Logger.log("Data retrieved: %s rows", data.length);

  const employees = data.slice(1).map((r, index) => {
    const emp = {
      email: r[0],
      name: r[1],
      role: r[2],
      code: r[3]
    };
    Logger.log("Row %s processed: %s", index + 2, JSON.stringify(emp));
    return emp;
  });

  const result = JSON.parse(JSON.stringify(employees));
  Logger.log("Total employees returned: %s", result.length);

  return result;
}

function addEmployee(employeeData) {
  if (!employeeData || !Array.isArray(employeeData) || employeeData.length < 4) {
    throw new Error("Invalid employee data. Expected [email, name, code, role]");
  }

  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName("Employees");

  if (!sheet) {
    sheet = ss.insertSheet("Employees");
    sheet.appendRow(["Email", "Name", "Code", "Role"]);
  }

  // Map fields correctly regardless of input order
  const email = employeeData[0].toLowerCase();
  const name = employeeData[1];
  const code = employeeData[2]; // input might be swapped
  const role = employeeData[3]; // input might be swapped

  // Check for duplicates safely
  const lastRow = sheet.getLastRow();
  let emails = [];
  if (lastRow > 1) {
    emails = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().map(e => e.toLowerCase());
  }

  if (emails.includes(email)) {
    return false; // duplicate
  }

  // Append in correct order: Email | Name | Code | Role
  sheet.appendRow([name, email, code, role]);
  return true;
}

// Get filter options for dropdowns with normalization and Division support
/**
 * Returns all filter options dynamically from the sheet
 */
function getFilterOptions() {
  const ss = SpreadsheetApp.getActive();   // use active file
  Logger.log("Spreadsheet loaded: %s", ss.getName());

  // ---------------------------------------------------
  // 1️⃣ LOAD EMPLOYEE LIST  (from "Employees" sheet)
  // ---------------------------------------------------
  const empSheet = ss.getSheetByName("Employees");
  if (!empSheet) {
    Logger.log("Error: 'Employees' sheet not found!");
    return;
  }
  Logger.log("Employees sheet found");

  const empData = empSheet.getDataRange().getValues();
  Logger.log("Total rows in Employees sheet: %s", empData.length);

  const employees = [];
  for (let i = 1; i < empData.length; i++) {
    const row = empData[i];
    const employeeObj = {
      name: row[0] || "",   // Name
      email: row[1] || "",  // Email
      code: row[2] || ""    // Code (EMP00001 etc)
    };
    employees.push(employeeObj);
    Logger.log("Loaded employee: %s", JSON.stringify(employeeObj));
  }

  Logger.log("Total employees loaded: %s", employees.length);

  // ---------------------------------------------------
  // 2️⃣ LOAD LOCATION DATA (from "Visits" sheet)
  //     Generate: States → Divisions → Districts
  // ---------------------------------------------------
  const visitSheet = ss.getSheetByName("Visits");
  if (!visitSheet) {
    Logger.log("Error: 'Visits' sheet not found!");
    return;
  }
  Logger.log("Visits sheet found");

  const vData = visitSheet.getDataRange().getValues();
  Logger.log("Total rows in Visits sheet: %s", vData.length);

  const vHead = vData[0].map(h => String(h).trim().toLowerCase());
  Logger.log("Visits sheet headers: %s", JSON.stringify(vHead));

  const idx = {
    state: vHead.indexOf("state"),
    division: vHead.indexOf("division"),
    district: vHead.indexOf("district")
  };
  Logger.log("Header indices: %s", JSON.stringify(idx));

  const states = {};

  for (let i = 1; i < vData.length; i++) {
    const row = vData[i];

    const state = row[idx.state] || "";
    const division = row[idx.division] || "";
    const district = row[idx.district] || "";

    if (!state) {
      Logger.log("Skipping row %s: state is empty", i + 1);
      continue;
    }

    if (!states[state]) states[state] = {};
    if (!states[state][division]) states[state][division] = [];

    if (district && !states[state][division].includes(district)) {
      states[state][division].push(district);
      Logger.log("Added district '%s' under division '%s' in state '%s'", district, division, state);
    }
  }

  Logger.log("Total states loaded: %s", Object.keys(states).length);

  // ---------------------------------------------------
  // 3️⃣ RETURN TO FRONTEND
  // ---------------------------------------------------
  const result = {
    employees: employees,
    states: states,
    statuses: ["Pending", "Completed"]
  };

  Logger.log("Final filter options prepared: %s", JSON.stringify(result));

  return JSON.parse(JSON.stringify(result));
}



function getFilteredData(state, division, district, empCode, status, startDate, endDate) {
  const sh = SpreadsheetApp.getActive().getSheetByName("Visits");
  const data = sh.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const rows = data.slice(1);

  Logger.log("============================================");
  Logger.log("           FILTER CALL RECEIVED");
  Logger.log("============================================");
  Logger.log("State: " + state);
  Logger.log("Division: " + division);
  Logger.log("District: " + district);
  Logger.log("Employee Code: " + empCode);
  Logger.log("Status: " + status);
  Logger.log("Start Date: " + startDate);
  Logger.log("End Date: " + endDate);

  // COLUMN INDEXES
  const col = {
    state: headers.indexOf("state"),
    division: headers.indexOf("division"),
    district: headers.indexOf("district"),
    empCode: headers.indexOf("employee id"),
    status: headers.indexOf("status"),
    date: headers.indexOf("date of visit")
  };

  Logger.log("COLUMN INDEXES FOUND: " + JSON.stringify(col));

  for (let key in col) {
    if (col[key] === -1) {
      Logger.log("❌ ERROR: MISSING COLUMN: " + key);
    }
  }

  // FILTER LOGIC
  const result = rows.filter((r) => {
    const rowState = r[col.state] || "";
    const rowDivision = r[col.division] || "";
    const rowDistrict = r[col.district] || "";
    const rowEmp = r[col.empCode] || "";
    const rowStatus = r[col.status] || "";
    const rowDate = r[col.date] ? new Date(r[col.date]) : null;

    // Apply filters ONLY if values are provided
    if (state && rowState !== state) return false;
    if (division && rowDivision !== division) return false;
    if (district && rowDistrict !== district) return false;
    if (empCode && rowEmp !== empCode) return false;
    if (status && rowStatus !== status) return false;

    if (startDate) {
      const sd = new Date(startDate);
      if (!rowDate || rowDate < sd) return false;
    }

    if (endDate) {
      const ed = new Date(endDate);
      if (!rowDate || rowDate > ed) return false;
    }

    return true;
  });

  Logger.log("============================================");
  Logger.log("TOTAL MATCHING ROWS: " + result.length);
  Logger.log("============================================");

  // Return all rows if no filters are provided
  if (!state && !division && !district && !empCode && !status && !startDate && !endDate) {
    return JSON.parse(JSON.stringify(rows));
  }

  return JSON.parse(JSON.stringify(result));
}

// -------------------------
// HELPER: Get Employee by Email
// -------------------------
function getEmployeeByEmail(email) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log("Active spreadsheet: %s", ss.getName());

  const empSheet = ss.getSheetByName("Employees");
  if (!empSheet) {
    Logger.log("Sheet 'Employees' not found.");
    return null;
  }
  Logger.log("Found sheet: %s", empSheet.getName());

  const data = empSheet.getDataRange().getValues();
  Logger.log("Data retrieved: %s rows", data.length);

  const headers = data[0];
  const emailIdx = headers.indexOf("Email");
  const nameIdx = headers.indexOf("Name");
  const codeIdx = headers.indexOf("Code");

  if (emailIdx === -1 || nameIdx === -1 || codeIdx === -1) {
    Logger.log("One or more required headers missing: Email, Name, Code");
    return null;
  }

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[emailIdx] === email) {
      const employee = {
        name: row[nameIdx],
        code: row[codeIdx] || ""
      };
      Logger.log("Employee found at row %s: %s", i + 1, JSON.stringify(employee));
      return JSON.parse(JSON.stringify(employee)); // Return JSON-safe object
    }
  }

  Logger.log("Employee with email '%s' not found.", email);
  return null;
}



/**
 * CLEANUP SCRIPT FOR VISITS & EMPLOYEES SHEETS
 * --------------------------------------------
 * Fixes:
 * - Case normalization (State, Division, District)
 * - Removes extra spaces
 * - Fixes misaligned Employees sheet rows
 * - Ensures Employee ID is correctly mapped to Visits
 * - Standardizes values automatically
 */
function cleanSheets() {
  const ss = SpreadsheetApp.getActive();

  // ============= VISITS SHEET =====================
  const visitsSh = ss.getSheetByName("Visits");
  const vData = visitsSh.getDataRange().getValues();
  const vHead = vData[0];

  const idx = {
    state: vHead.indexOf("State"),
    division: vHead.indexOf("Division"),
    district: vHead.indexOf("District"),
    empName: vHead.indexOf("Employee Name"),
    empID: vHead.indexOf("Employee ID"),
  };

  // Clean text helper
  const clean = s => s ? String(s).trim() : "";

  // Convert to title case (except all caps allowed for ID)
  const titleCase = s => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  // Load employees for ID auto-fill
  const employeesMap = loadEmployeeMap();

  for (let i = 1; i < vData.length; i++) {
    let r = vData[i];

    // Normalize State, Division, District
    if (r[idx.state])    r[idx.state] = titleCase(clean(r[idx.state]));
    if (r[idx.division]) r[idx.division] = titleCase(clean(r[idx.division]));
    if (r[idx.district]) r[idx.district] = titleCase(clean(r[idx.district]));

    // Clean employee name
    let empName = clean(r[idx.empName]);

    // Fill Employee ID from Employees sheet
    if (!r[idx.empID] && employeesMap.byName[empName]) {
      r[idx.empID] = employeesMap.byName[empName];
    }

    // If Employee ID exists but name does not, fix name
    if (r[idx.empID] && employeesMap.byID[r[idx.empID]]) {
      r[idx.empName] = employeesMap.byID[r[idx.empID]].name;
    }
  }

  // Write cleaned data back
  visitsSh.getRange(1, 1, vData.length, vData[0].length).setValues(vData);



  // ============= EMPLOYEES SHEET =====================
  const empSh = ss.getSheetByName("Employees");
  const eData = empSh.getDataRange().getValues();
  const eHead = eData[0];

  const eIdx = {
    name: eHead.indexOf("Name"),
    email: eHead.indexOf("Email"),
    code: eHead.indexOf("Code"),   // Employee ID
    role: eHead.indexOf("Role")
  };

  for (let i = 1; i < eData.length; i++) {
    let r = eData[i];

    // Clean name/email with correct mapping
    r[eIdx.name]  = clean(r[eIdx.name]);
    r[eIdx.email] = clean(r[eIdx.email]);
    r[eIdx.code]  = clean(r[eIdx.code]);
    r[eIdx.role]  = clean(r[eIdx.role]);

    // Fix the misaligned row
    // Detect when "Name" column actually contains email
    if (r[eIdx.name] && r[eIdx.name].includes("@")) {
      // Shift values correctly
      let email = r[eIdx.name];
      let name = r[eIdx.email];
      let code = r[eIdx.role]; // EMP00001 is stored wrongly in Role
      let role = r[eIdx.code];

      r[eIdx.name]  = name;
      r[eIdx.email] = email;
      r[eIdx.code]  = code;
      r[eIdx.role]  = role;
    }
  }

  // Write cleaned employees
  empSh.getRange(1, 1, eData.length, eData[0].length).setValues(eData);


  SpreadsheetApp.getUi().alert("Cleanup completed successfully!");
}



/**
 * Build lookup table for employee names & IDs
 */
function loadEmployeeMap() {
  const empSh = SpreadsheetApp.getActive().getSheetByName("Employees");
  const empData = empSh.getDataRange().getValues();
  const head = empData[0];

  const idx = {
    name: head.indexOf("Name"),
    email: head.indexOf("Email"),
    code: head.indexOf("Code")
  };

  let byName = {};
  let byID = {};

  for (let i = 1; i < empData.length; i++) {
    let r = empData[i];

    let name = String(r[idx.name]).trim();
    let id = String(r[idx.code]).trim();

    if (name && id) {
      byName[name] = id;
      byID[id] = { name };
    }
  }

  return { byName, byID };
}


/* =================== END OF SCRIPT =================== */
