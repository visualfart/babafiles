import { getDict, isLang, type Lang } from "@/i18n";

export default async function About({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: l } = await params;
  const lang = (isLang(l) ? l : "en") as Lang; const t = getDict(lang);
  const en = (
    <div className="prose mt-8 text-[14px]">
      <p>babafiles is an open, sourced database of what courts, police, regulators and official inquiries have put on the record about self-styled godmen and godwomen, religious organisations and temple trusts, in India and abroad.</p>
      <p>People hand money, land, labour and their children&rsquo;s safety to religious figures on trust. When that trust is abused the evidence usually exists, but it is scattered across court websites, press archives and regulator portals in several languages, and it is easy to dismiss as rumour. This site collects that record in one place, links every statement to a primary source, archives every source, and labels every entry with its exact legal status so that anyone can check it for themselves.</p>
      <h2>What it is not</h2>
      <ul>
        <li>It is not a list of &ldquo;fake babas&rdquo;. The site never makes that judgement in its own voice.</li>
        <li>It does not publish unverified testimony.</li>
        <li>It does not place anyone in an adverse tier because of controversy alone. Prominent living figures with no adverse official record are listed as exactly that, with the date and the registers checked.</li>
      </ul>
      <h2>Funding</h2>
      <p>No advertising. No affiliate links. No donations from religious organisations or their affiliates. The project is currently self-funded by its maintainers.</p>
      <h2>Corrections</h2>
      <p>Open an issue on the public repository with the claim id and the contradicting source, or write to the address published there. Every accepted change is listed on the corrections page.</p>
      <h2>Disclaimer</h2>
      <p>This site reports the contents of public records and on-record reporting. Tier labels describe the legal status of a matter at the stated date and are not an assertion of guilt beyond what the cited record states. Matters under investigation or on appeal may be resolved in the subject&rsquo;s favour; when they are, the record is updated and the change logged.</p>
      <h2>Open data</h2>
      <p>The dataset is CC-BY-4.0 and the code is MIT, at <a href="https://github.com/visualfart/babafiles">github.com/visualfart/babafiles</a>. A JSON export of the whole database is at <a href="/data/babafiles.json">/data/babafiles.json</a>.</p>
    </div>
  );
  const hi = (
    <div className="prose mt-8 text-[14px]">
      <p>babafiles एक खुला, स्रोत-सहित डेटाबेस है जो बताता है कि अदालतों, पुलिस, नियामकों और आधिकारिक जाँचों ने स्वयंभू बाबाओं, धार्मिक संगठनों और मंदिर ट्रस्टों के बारे में, भारत और विदेश में, रिकॉर्ड पर क्या रखा है।</p>
      <p>लोग भरोसे पर धार्मिक व्यक्तियों को पैसा, ज़मीन, श्रम और अपने बच्चों की सुरक्षा सौंप देते हैं। जब उस भरोसे का दुरुपयोग होता है तो सबूत आमतौर पर मौजूद होता है, पर वह कई भाषाओं में अदालती वेबसाइटों, समाचार अभिलेखों और नियामक पोर्टलों पर बिखरा रहता है और उसे अफ़वाह कहकर खारिज करना आसान होता है। यह साइट उस रिकॉर्ड को एक जगह इकट्ठा करती है, हर कथन को प्राथमिक स्रोत से जोड़ती है, हर स्रोत को संग्रहीत करती है और हर प्रविष्टि पर उसकी सटीक कानूनी स्थिति अंकित करती है ताकि कोई भी खुद जाँच सके।</p>
      <h2>यह क्या नहीं है</h2>
      <ul>
        <li>यह &ldquo;नकली बाबाओं&rdquo; की सूची नहीं है। साइट अपनी ओर से ऐसा कोई निर्णय नहीं देती।</li>
        <li>यह असत्यापित गवाही प्रकाशित नहीं करती।</li>
        <li>केवल विवाद के आधार पर किसी को प्रतिकूल श्रेणी में नहीं रखा जाता। जिन प्रमुख जीवित व्यक्तियों का कोई प्रतिकूल आधिकारिक रिकॉर्ड नहीं है, उन्हें ठीक वैसा ही, तारीख और जाँचे गए रजिस्टरों के साथ, सूचीबद्ध किया जाता है।</li>
      </ul>
      <h2>वित्तपोषण</h2>
      <p>कोई विज्ञापन नहीं। कोई एफ़िलिएट लिंक नहीं। धार्मिक संगठनों या उनसे जुड़े लोगों से कोई दान नहीं। परियोजना फ़िलहाल इसके रखरखावकर्ताओं द्वारा स्व-वित्तपोषित है।</p>
      <h2>सुधार</h2>
      <p>सार्वजनिक रिपॉज़िटरी पर दावे की आईडी और खंडन करने वाले स्रोत के साथ एक इशू खोलें, या वहाँ प्रकाशित पते पर लिखें। हर स्वीकृत बदलाव सुधार पृष्ठ पर सूचीबद्ध होता है।</p>
      <h2>अस्वीकरण</h2>
      <p>यह साइट सार्वजनिक रिकॉर्ड और ऑन-रिकॉर्ड रिपोर्टिंग की विषयवस्तु बताती है। श्रेणी-लेबल बताई गई तारीख पर मामले की कानूनी स्थिति दर्शाते हैं और उद्धृत रिकॉर्ड से आगे अपराध का दावा नहीं करते। जाँच या अपील में चल रहे मामले विषय के पक्ष में भी तय हो सकते हैं; ऐसा होने पर रिकॉर्ड अद्यतन किया जाता है और बदलाव दर्ज किया जाता है।</p>
      <h2>खुला डेटा</h2>
      <p>डेटा CC-BY-4.0 और कोड MIT के अंतर्गत <a href="https://github.com/visualfart/babafiles">github.com/visualfart/babafiles</a> पर है। पूरे डेटाबेस का JSON निर्यात <a href="/data/babafiles.json">/data/babafiles.json</a> पर है।</p>
    </div>
  );
  return (<div className="pt-6"><h1>{t.nav.about}</h1>{lang === "hi" ? hi : en}</div>);
}
