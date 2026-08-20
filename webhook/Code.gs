// 🔒 Token secreto: solo Netlify lo conoce. Bloquea POSTs anónimos.
const TOKEN_SECRETO = "8ceff71ebec268767dc280b2c929f581";

// 📄 Nombre EXACTO de la pestaña donde está la lista de invitados.
//    (Antes se usaba getActiveSheet(), que con varias pestañas escribía
//     en la hoja equivocada y "perdía" las confirmaciones.)
const NOMBRE_HOJA = "Hoja 1";

// 🎨 Colores de fila
const VERDE_CLARO = "#d9ead3"; // confirma que SÍ asiste
const AMARILLO    = "#fff3cd"; // invitado no encontrado en la lista

function normaliza(s) {
  return (s || "").toString().trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function coincide(apellido, nombreEscrito) {
  const a = normaliza(apellido);
  if (!a) return false;
  const n = " " + normaliza(nombreEscrito) + " ";
  return n.indexOf(" " + a + " ") !== -1;
}

// Devuelve true si la asistencia significa "sí"
function esSi(valor) {
  const v = normaliza(valor);
  return v === "si" || v === "yes" || v === "y";
}

function doPost(e) {
  // 🔒 Verificación del token
  if (!e || !e.parameter || e.parameter.token !== TOKEN_SECRETO) {
    return ContentService.createTextOutput("no autorizado");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const p = JSON.parse(e.postData.contents);
    const d = p.data || {};

    const id = p.id || (d.name + "|" + (p.created_at || ""));
    const cache = CacheService.getScriptCache();
    if (cache.get(id)) return ContentService.createTextOutput("duplicado");
    cache.put(id, "1", 21600);

    // ✅ Hoja fija por nombre (NO getActiveSheet)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);
    if (!sheet) return ContentService.createTextOutput("hoja no encontrada: " + NOMBRE_HOJA);

    const valores = [
      d.attending || "",                        // C asiste
      d.guestNames || "",                       // D invitados
      d.message || "",                          // E Mensaje
      new Date(p.created_at || Date.now()),     // F Fecha confirmación
      d.phone || ""                             // G Teléfono
    ];

    const confirma = esSi(d.attending);

    const lastRow = sheet.getLastRow();
    let fila = -1;
    if (lastRow >= 2) {
      const apellidos = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < apellidos.length; i++) {
        if (coincide(apellidos[i][0], d.name)) { fila = i + 2; break; }
      }
    }

    if (fila > 0) {
      sheet.getRange(fila, 3, 1, 5).setValues([valores]);
      // 🎨 Fila completa verde si confirma; sin color si dijo No
      sheet.getRange(fila, 1, 1, 7).setBackground(confirma ? VERDE_CLARO : null);
    } else {
      const r = lastRow + 1;
      sheet.getRange(r, 1, 1, 7).setValues([[d.name || "", "", ...valores]]);
      // No estaba en la lista: amarillo de aviso (y verde si además confirmó)
      sheet.getRange(r, 1, 1, 7).setBackground(confirma ? VERDE_CLARO : AMARILLO);
    }

    return ContentService.createTextOutput("ok");
  } finally {
    lock.releaseLock();
  }
}
