// drill.js

var transformations = [
  { from: "causative", to: "dictionary" },
  { from: "causative negative", to: "dictionary" },
  { from: "causative passive", to: "dictionary" },
  { from: "causative passive negative", to: "dictionary" },
  { from: "imperative", to: "dictionary" },
  { from: "imperative negative", to: "dictionary" },
  { from: "negative", to: "dictionary" },
  { from: "passive", to: "dictionary" },
  { from: "passive negative", to: "dictionary" },
  { from: "past", to: "dictionary" },
  { from: "past negative", to: "dictionary" },
  { from: "polite", to: "dictionary" },
  { from: "polite negative", to: "dictionary" },
  { from: "polite past", to: "dictionary" },
  { from: "polite past negative", to: "dictionary" },
  { from: "polite progressive", to: "dictionary" },
  { from: "polite progressive negative", to: "dictionary" },
  { from: "polite progressive past", to: "dictionary" },
  { from: "polite progressive past negative", to: "dictionary" },
  { from: "potential", to: "dictionary" },
  { from: "potential negative", to: "dictionary" },
  { from: "progressive", to: "dictionary" },
  { from: "progressive negative", to: "dictionary" },
  { from: "progressive past", to: "dictionary" },
  { from: "progressive past negative", to: "dictionary" },
  { from: "te-form", to: "dictionary" },
  { from: "te-form negative", to: "dictionary" },
];

var log;

Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)]
}

// From: http://stackoverflow.com/a/2897510

new function ($) {
  $.fn.getCursorPosition = function () {
    var input = this.get(0);
    if (!input) return; // No (input) element found
    if ('selectionStart' in input) {
      // Standard-compliant browsers
      return input.selectionStart;
    } else if (document.selection) {
      // IE
      input.fmcus();
      var sel = document.selection.createRange();
      var selLen = document.selection.createRange().text.length;
      sel.moveStart('character', -input.value.length);
      return sel.text.length - selLen;
    }
  }
}(jQuery);

// From: http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area

new function ($) {
  $.fn.setCursorPosition = function (pos) {
    if (this.setSelectionRange) {
      this.setSelectionRange(pos, pos);
    } else if (this.createTextRange) {
      var range = this.createTextRange();
      range.collapse(true);
      if (pos < 0) {
        pos = $(this).val().length + pos;
      }
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  }
}(jQuery);

function commaList(items, conjunction) {

  if (conjunction == undefined) {
    conjunction = "and";
  }

  var result = "";

  for (var i = 0; i < items.length; i++) {
    result = result + items[i];

    if (i < (items.length - 2)) {
      result += ", ";
    }

    if (i == (items.length - 2)) {
      result += " " + conjunction + " ";
    }
  }

  return result;
}

function resetLog() {
  log = { "history": [] };
}

function getVerbForms(entry) {

  function kanaForm(words) {

    if (words.constructor !== Array) {
      words = [words];
    }

    return words.map(function (word) { return word.split(/.\[([^\]]*)\]/).join(""); } );
  }

  function kanjiForm(words) {

    if (words.constructor !== Array) {
      words = [words];
    }

    return words.map(function (word) { return word.split(/(.)\[[^\]]*\]/).join(""); } );
  }

  var result = {
    "kanji": {},
    "hiragana": {},
    "furigana": {}
  };

  Object.keys(words[entry].conjugations).forEach(function (key) {
    result["kanji"][key] = kanjiForm(words[entry].conjugations[key]);
    result["hiragana"][key] = kanaForm(words[entry].conjugations[key]);
    result["furigana"][key] = words[entry].conjugations[key];
  });

  return result;
}

function wordWithFurigana(words) {

  if (words.constructor !== Array) {
    words = [words];
  }

  return words.map(function (word) {

    var bits = word.split(/(.)\[([^\]]*)\]/);
  
    while (bits.length > 1) {
      bits[0] = bits[0] + "<span tooltip='" + bits[2] + "'>" + bits[1] + "</span>" + bits[3];
      bits.splice(1, 3);
    }
  
    return bits[0];
  });
}

function processAnswerKey() {

  var el = $('#answer');

  var pos = el.getCursorPosition();
  var val = el.val();

  var last1 = val.slice(pos - 1, pos);
  var last2 = val.slice(pos - 2, pos);
  var last3 = val.slice(pos - 3, pos);

  var replace1 = {
    "a": "あ", "i": "い", "u": "う", "e": "え", "o": "お"
  };

  var replace2 = {

    "ka": "か", "ki": "き", "ku": "く", "ke": "け", "ko": "こ",
    "sa": "さ", "si": "し", "su": "す", "se": "せ", "so": "そ",
    "ta": "た", "ti": "ち", "tu": "つ", "te": "て", "to": "と",
    "na": "な", "ni": "に", "nu": "ぬ", "ne": "ね", "no": "の",
    "ha": "は", "hi": "ひ", "hu": "ふ", "he": "へ", "ho": "ほ",
    "ma": "ま", "mi": "み", "mu": "む", "me": "め", "mo": "も",
    "ra": "ら", "ri": "り", "ru": "る", "re": "れ", "ro": "ろ",
    "ga": "が", "gi": "ぎ", "gu": "ぐ", "ge": "げ", "go": "ご",
    "za": "ざ", "zi": "じ", "zu": "ず", "ze": "ぜ", "zo": "ぞ",
    "da": "だ", "di": "ぢ", "du": "づ", "de": "で", "do": "ど",
    "ba": "ば", "bi": "び", "bu": "ぶ", "be": "べ", "bo": "ぼ",
    "pa": "ぱ", "pi": "ぴ", "pu": "ぷ", "pe": "ぺ", "po": "ぽ",

    "qa": "くぁ", "qi": "くぃ", "qu": "く", "qe": "くぇ", "qo": "くぉ",
    "wa": "わ", "wi": "うぃ", "wu": "う", "we": "うぇ", "wo": "を",
    "ya": "や", "yi": "い", "yu": "ゆ", "ye": "いぇ", "yo": "よ",
    "fa": "ふぁ", "fi": "ふぃ", "fu": "ふ", "fe": "ふぇ", "fo": "ふぉ",
    "ja": "じゃ", "ji": "じ", "ju": "じゅ", "je": "じぇ", "jo": "じょ",
    "la": "ぁ", "li": "ぃ", "lu": "ぅ", "le": "ぇ", "lo": "ぉ",
    "za": "ざ", "zi": "じ", "zu": "ず", "ze": "ぜ", "zo": "ぞ",
    "xa": "ぁ", "xi": "ぃ", "xu": "ぅ", "xe": "ぇ", "xo": "ぉ",
    "ca": "か", "ci": "し", "cu": "く", "ce": "せ", "co": "こ",
    "va": "ヴぁ", "vi": "ヴぃ", "vu": "ヴ", "ve": "ヴぇ", "vo": "ヴぉ",

    "lu": "っ",

    "nn": "ん", "n'": "ん",

    "nb": "んb", "nc": "んc", "nd": "んd", "nf": "んf", "ng": "んg",
    "nh": "んh", "nj": "んj", "nk": "んk", "nl": "んl", "nm": "んm",
    "np": "んp", "nq": "んq", "nr": "んr", "ns": "んs", "nt": "んt",
    "nv": "んv", "nw": "んw", "nx": "んx", "nz": "んz",

    "aa": "っa", "bb": "っb", "cc": "っc", "dd": "っd", "ee": "っe",
    "ff": "っf", "gg": "っg", "hh": "っh", "ii": "っi", "jj": "っj",
    "kk": "っk", "ll": "っl", "mm": "っm", "oo": "っo", "pp": "っp",
    "qq": "っq", "rr": "っr", "ss": "っs", "tt": "っt", "uu": "っu",
    "vv": "っv", "ww": "っw", "xx": "っx", "yy": "っy", "zz": "っz",
  };

  var replace3 = {

    "kya": "きゃ", "kyi": "きぃ", "kyu": "きゅ", "kye": "きぇ", "kyo": "きょ",
    "sha": "しゃ", "shi": "し", "shu": "しゅ", "she": "しぇ", "sho": "しょ",
    "cha": "ちゃ", "chi": "ち", "chu": "ちゅ", "che": "ちぇ", "cho": "ちょ",
    "nya": "にゃ", "nyi": "にぃ", "nyu": "にゅ", "nye": "にぇ", "nyo": "にょ",
    "hya": "ひゃ", "hyi": "ひぃ", "hyu": "ひゅ", "hye": "ひぇ", "hyo": "ひょ",
    "mya": "みゃ", "myi": "みぃ", "myu": "みゅ", "mye": "みぇ", "myo": "みょ",
    "rya": "りゃ", "ryi": "りぃ", "ryu": "りゅ", "rye": "りぇ", "ryo": "りょ",
    "gya": "ぎゃ", "gyi": "ぎぃ", "gyu": "ぎゅ", "gye": "ぎぇ", "gyo": "ぎょ",
    "zya": "じゃ", "zyi": "じぃ", "zyu": "じゅ", "zye": "じぇ", "zyo": "じょ",
    "dya": "ぢゃ", "dyi": "ぢぃ", "dyu": "ぢゅ", "dye": "ぢぇ", "dyo": "ぢょ",
    "bya": "びゃ", "byi": "びぃ", "byu": "びゅ", "bye": "びぇ", "byo": "びょ",
    "pya": "ぴゃ", "pyi": "ぴぃ", "pyu": "ぴゅ", "pye": "ぴぇ", "pyo": "ぴょ",

    "shi": "し",
    "tsu": "つ",
  };

  if (replace3[last3]) {
    val = val.slice(0, pos - 3) + replace3[last3] + val.slice(pos, -1);
    el.val(val);
    el.setCursorPosition(pos - 3 + replace3[last3].length);
  } else if (replace2[last2]) {
    val = val.slice(0, pos - 2) + replace2[last2] + val.slice(pos, -1);
    el.val(val);
    el.setCursorPosition(pos - 2 + replace2[last2].length);
  } else if (replace1[last1]) {
    val = val.slice(0, pos - 1) + replace1[last1] + val.slice(pos, -1);
    el.val(val);
    el.setCursorPosition(pos - 1 + replace1[last1].length);
  }
}

function validQuestion(entry, forms, transformation, options) {

  var valid = true;

  transformation.tags.forEach(function (type) {
    if (options[type] == false) {
      valid = false;
    }
  });

  if (options[words[entry].group] == false) {
    valid = false;
  }

  if (!forms["furigana"][transformation.from])
    valid = false;

  if (!forms["furigana"][transformation.to])
    valid = false;

  return valid;
}

function generateQuestion() {

  var entry;
  var to_form;
  var from_form;
  var forms;

  var count = 0;

  while (true) {

    if (count++ == 10000) {
      showSplash();
      return;
    }

    entry = Object.keys(words).randomElement();
    transformation = transformations.randomElement();

    from_form = transformation.from;
    to_form = transformation.to;

    forms = getVerbForms(entry);

    var valid = validQuestion(entry, forms, transformation, getOptions());

    if (valid) {
      break;
    }
  }

  var kanjiForms = forms["kanji"];
  var kanaForms = forms["hiragana"];
  var furiganaForms = forms["furigana"];

  var question = "What is the " + transformation.phrase + " form of " +
    wordWithFurigana(furiganaForms[from_form]).randomElement() + "?";

  var answer = kanjiForms[to_form];
  var answer2 = kanaForms[to_form];

  $('#question').html(question);

  window.question = question;
  window.answer = kanjiForms[to_form];
  window.answerWithFurigana = wordWithFurigana(furiganaForms[to_form]);
  window.answer2 = answer2;

  $('#next').prop('disabled', true);
  $('#response').html("");
  $('#message').html("");

  $('#proceed').hide();
  $('#input').show();
  $('#answer').focus();

  $('#answer').on('input', processAnswerKey);
}

function processAnswer() {

  var response = $('#answer').val().trim();

  if (response == "")
    return;

  var correct = ((window.answer.indexOf(response) != -1) || (window.answer2.indexOf(response) != -1));

  var klass = correct ? "correct" : "incorrect";

  log.history.push({
    "question": window.question,
    "response": response,
    "answer": window.answerWithFurigana,
    "kana": window.answer2,
    "correct": correct
  });

  $('#answer').val("");
  $('#response').prop('class', klass).text(response);
  $('#next').prop('disabled', false);

  if (correct) {
    $('#message').html("");
  } else {
    $('#message').html("<div>The correct answer was " + commaList(window.answerWithFurigana, "or") + "</div>");
  }

  $('#input').hide();
  $('#proceed').show();
  $('#proceed button').focus();

  updateHistoryView(log);
}

function updateHistoryView(log) {

  var review = $('<table>');

  var total = 0;
  var correct = 0;

  var header_tr = $('<tr>');

  header_tr.append($('<th>Question</th>'));
  header_tr.append($('<th>Answer</th>'));
  header_tr.append($('<th>Response</th>'));

  review.append(header_tr);

  log.history.forEach(function (entry) {

    total++;

    if (entry.correct) {
      correct++;
    }

    var tr = $('<tr>');

    var td1 = $('<td>');
    var td2 = $('<td>');
    var td3 = $('<td>');

    td1.html(entry.question);
    td2.html(commaList(entry.answer, "or"));
    td3.text(entry.response);

    tr.append(td1);
    tr.append(td2);
    tr.append(td3);

    if (entry.correct) {
      td3.append("<span class='answer-correct'> ○</span>");
    } else {
      td3.append("<span class='answer-wrong'> ×</span>");
    }
    review.append(tr);
  });

  $('#history').empty().append(review);

  $('#history').append("<p>" + correct + " of " + total + " correct.</p>");
}

function proceed() {
  if (log.history.length == $('#numQuestions').val()) {
    endQuiz();
  } else {
    generateQuestion();
  }
}

function showSplash() {
  $('#splash').show();
  $('#quizSection').hide();
  $('#scoreSection').hide();

  $('#go').focus();
}

function startQuiz() {
  $('#splash').hide();
  $('#quizSection').show();
  $('#scoreSection').hide();

  resetLog();
  generateQuestion();
}

function endQuiz() {
  $('#splash').hide();
  $('#quizSection').hide();
  $('#scoreSection').show();

  $('#backToStart').focus();
}

function arrayDifference(a, b) {
  // From http://stackoverflow.com/a/1723220
  return a.filter(function (x) { return b.indexOf(x) < 0 });
}

function arrayUnique(arr) {
  return arr.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}

function calculateTransitions() {

  function getTags(str) {

    var tags = str.split(" ");

    if ((tags.length == 1) && (tags[0] == "plain")) {
      tags = [];
    }

    return tags;
  }

  function calculateTags(tags) {

    tags = tags.split(" ");

    if (tags.indexOf("polite") == -1) {
      tags.push("plain");
    }

    if (tags.indexOf("dictionary") != -1) {
      tags.splice(tags.indexOf("dictionary"), 1);
    }

    return tags;
  }

  transformations.forEach(function (transformation) {

    var from = getTags(transformation.from);
    var to = getTags(transformation.to);

    var from_extra = {
      "negative": "affirmative",
      "past": "present",
      "polite": "plain",
      "te-form": "non-て",
      "potential": "non-potential",
      "imperative": "non-imperative",
      "causative": "non-causative",
      "passive": "active",
      "progressive": "non-progressive",
    };

    var to_extra = {
      "negative": "negative",
      "past": "past",
      "polite": "polite",
      "te-form": "て",
      "potential": "potential",
      "imperative": "imperative",
      "causative": "causative",
      "passive": "passive",
      "progressive": "progressive",
    };

    transformation.phrase = "dictionary";

    transformation.tags = arrayUnique(calculateTags(transformation.from).concat(calculateTags(transformation.to)));

  });
}

function updateOptionSummary() {

  // Calculate how many questions will apply

  var options = getOptions();
  var applicable = 0;

  Object.keys(words).forEach(function (word) {

    var forms = getVerbForms(word);

    transformations.forEach(function (transformation) {

      if (validQuestion(word, forms, transformation, options)) {
        applicable++;
      }
    });
  });

  $("#questionCount").text(applicable);
}

function getOptions() {

  var options = ["plain", "polite", "negative", "past", "te-form",
    "progressive", "potential", "imperative", "passive", "causative",
    "godan", "ichidan", "iku", "kuru", "suru", "i-adjective", "na-adjective",
    "ii"];

  var result = {};

  options.forEach(function (option) {
    result[option] = $('#' + option).is(':checked') != false;
  });

  return result;
}

$('window').ready(function () {

  calculateTransitions();

  $('#go').click(startQuiz);
  $('#backToStart').click(showSplash);

  $('div.options input').click(updateOptionSummary);

  updateOptionSummary();

  showSplash();
});
