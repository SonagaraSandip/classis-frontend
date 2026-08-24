/**
 * Centralized Gujarati Error & Success Message Handler
 * Converts technical / developer errors into friendly, easy-to-understand Gujarati messages.
 */

export const getGujaratiErrorMessage = (err, defaultMessage = "કંઈક સમસ્યા આવી છે, કૃપા કરીને ફરી પ્રયાસ કરો.") => {
  if (!err) return defaultMessage;

  // 1. Check for Network / Offline errors
  if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error") || !navigator.onLine) {
    return "ઇન્ટરનેટ અથવા સર્વર કનેક્શન નથી. કૃપા કરીને તમારું નેટવર્ક તપાસો.";
  }

  if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
    return "સર્વર પ્રતિસાદ આપવામાં વધુ સમય લઈ રહ્યું છે. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.";
  }

  // 2. Extract server response message
  const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message || "";
  const status = err.response?.status;

  // 3. Map status codes & specific error messages
  if (status === 401 || status === 403 || serverMsg.toLowerCase().includes("token") || serverMsg.toLowerCase().includes("unauthorized")) {
    return "તમારું લૉગિન સત્ર સમાપ્ત થઈ ગયું છે. કૃપા કરીને ફરીથી લૉગિન કરો.";
  }

  if (serverMsg.includes("Invalid master key") || serverMsg.includes("master key")) {
    return "ખોટી માસ્ટર કી દાખલ કરી છે. કૃપા કરીને સાચી કી નાખો.";
  }

  if (serverMsg.includes("Guest login failed")) {
    return "ગેસ્ટ લૉગિન કરવામાં સમસ્યા આવી છે. કૃપા કરીને ફરી પ્રયાસ કરો.";
  }

  if (status === 404 || serverMsg.includes("not found") || serverMsg.includes("Student not found")) {
    return "વિદ્યાર્થી અથવા વિનંતી કરેલી માહિતી મળી નથી.";
  }

  if (serverMsg.includes("Name and Class Standard are required") || serverMsg.includes("fill all fields") || serverMsg.includes("required")) {
    return "કૃપા કરીને બધી જરૂરી વિગતો (નામ અને ધોરણ) યોગ્ય રીતે ભરો.";
  }

  if (serverMsg.includes("Marks required") || serverMsg.includes("Subject / total missing")) {
    const studentName = serverMsg.split(":")[0] || "વિદ્યાર્થી";
    return `${studentName} માટે વિષય, કુલ ગુણ અથવા મેળવેલ ગુણ ભરવા જરૂરી છે.`;
  }

  if (serverMsg.includes("Class and date required")) {
    return "કૃપા કરીને ધોરણ અને પરીક્ષાની તારીખ પસંદ કરો.";
  }

  if (serverMsg.includes("Global subject & total marks required")) {
    return "કૃપા કરીને મુખ્ય વિષય અને કુલ ગુણ દાખલ કરો.";
  }

  if (serverMsg.includes("PDF") || serverMsg.includes("download")) {
    return "PDF બનાવવામાં અથવા ડાઉનલોડ કરવામાં સમસ્યા આવી છે.";
  }

  if (status >= 500) {
    return "સર્વરમાં સમસ્યા આવી છે. કૃપા કરીને થોડીવાર પછી ફરી પ્રયાસ કરો.";
  }

  // If there is already a readable Gujarati error message
  if (/[\u0A80-\u0AFF]/.test(serverMsg)) {
    return serverMsg;
  }

  return defaultMessage;
};

export const gujaratiToast = {
  // Student Messages
  studentAdded: "✅ વિદ્યાર્થી સફળતાપૂર્વક ઉમેરાઈ ગયો!",
  studentUpdated: "✅ વિદ્યાર્થીની વિગતો સફળતાપૂર્વક સુધારી લેવામાં આવી!",
  studentDeleted: (name) => `🗑️ "${name || 'વિદ્યાર્થી'}" નો રેકોર્ડ સફળતાપૂર્વક ડિલીટ કરવામાં આવ્યો!`,
  studentLoadError: "વિદ્યાર્થીઓની યાદી લોડ કરવામાં સમસ્યા આવી.",

  // Marks & Test Messages
  marksSaved: "✅ ગુણ સફળતાપૂર્વક સેવ થઈ ગયા!",
  marksSaveError: "ગુણ સેવ કરવામાં સમસ્યા આવી. કૃપા કરીને તપાસો.",
  pdfGenerating: "📄 PDF તૈયાર થઈ રહી છે...",
  pdfSuccess: "✅ PDF સફળતાપૂર્વક ડાઉનલોડ થઈ ગઈ!",
  pdfError: "PDF ડાઉનલોડ કરવામાં નિષ્ફળતા મળી.",

  // Auth Messages
  loginTeacherSuccess: "🎉 શિક્ષક તરીકે સફળતાપૂર્વક લૉગિન થયું!",
  loginGuestSuccess: "🎉 ગેસ્ટ તરીકે સફળતાપૂર્વક લૉગિન થયું!",
  logoutSuccess: "👋 સફળતાપૂર્વક લૉગઆઉટ થયું!",
  invalidKey: "ખોટી માસ્ટર કી દાખલ કરી છે.",
  enterKey: "કૃપા કરીને માસ્ટર કી દાખલ કરો.",
  
  // Validation Messages
  enterName: "કૃપા કરીને વિદ્યાર્થીનું નામ લખો.",
  selectStandard: "કૃપા કરીને ધોરણ પસંદ કરો.",
  selectDate: "કૃપા કરીને તારીખ પસંદ કરો.",
  selectSubject: "કૃપા કરીને વિષય પસંદ કરો.",
  enterTotalMarks: "કૃપા કરીને કુલ ગુણ દાખલ કરો.",
};
