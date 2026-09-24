type Activity = 'learning' | 'sporting' | 'debating' | 'rowing' | 'rugby' | 'polo' | 'soccer' | 'camping';

/** A small, cohesive set of original vector scenes for the offer transition. */
export function StudentActivityScene({ activity }: { activity: Activity }) {
  const student = <g className="student-scene__student" data-role="student">
    <g className="student-scene__head"><circle cx="252" cy="154" r="34" fill="#e6b792"/><path d="M219 149c-2-35 19-54 45-51 25 3 35 26 26 52-8-4-14-13-18-24-15 13-32 19-53 23Z" fill="#19363e"/><circle cx="241" cy="156" r="2.5" fill="#19363e"/><circle cx="266" cy="156" r="2.5" fill="#19363e"/><path d="M245 173q9 7 18 0" fill="none" stroke="#8e604c" strokeWidth="2.5" strokeLinecap="round"/></g>
    <path d="M237 184q15 13 31 0l7 24-43 2Z" fill="#daaa86"/>
    <path d="M226 198q24-12 52 0l20 106h-92Z" fill="#256b67" stroke="#174f4d" strokeWidth="4" strokeLinejoin="round"/>
    <path d="m232 204 20 20 20-20" fill="none" stroke="#c6ddc5" strokeWidth="7" strokeLinecap="round"/>
  </g>;

  const scene = (() => {
    switch (activity) {
      case 'learning': return <>
        <path d="M77 334h366" className="student-scene__ground"/>
        <rect x="116" y="292" width="281" height="17" rx="8" fill="#b78b5d"/><path d="M139 308v72m234-72v72" stroke="#8e6e51" strokeWidth="12" strokeLinecap="round"/>
        <g transform="translate(0 16)">{student}</g>
        <path d="M218 228q-27 5-42 65m103-65q25 11 35 62" className="student-scene__sleeves"/>
        <g className="student-scene__writing"><path d="M177 285q20-10 40-1" fill="none" stroke="#e6b792" strokeWidth="16" strokeLinecap="round"/><path d="m213 278 23 10" stroke="#19363e" strokeWidth="3" strokeLinecap="round"/></g>
        <path d="M235 282q-25-12-57-1v12q35-10 60 4 28-15 62-4v-12q-32-11-62 1Z" fill="#fff9e9" stroke="#174f4d" strokeWidth="3"/><path d="M238 282v15" stroke="#b9a982" strokeWidth="2"/>
        <g className="student-scene__idea"><circle cx="355" cy="120" r="25" fill="#f2dea7"/><path d="M347 148h16m-14 7h12" stroke="#a9813d" strokeWidth="4" strokeLinecap="round"/><path d="M355 102v-10m-37 23-9-6m82 6 9-6" stroke="#eac77c" strokeWidth="4" strokeLinecap="round"/></g>
      </>;
      case 'sporting': return <>
        <path d="M36 370h448m-383-25h104m97 0h99" className="student-scene__ground"/>
        <path d="M405 342V105m-29 10h58m-58 0v33h58v-33" fill="none" stroke="#d0c49c" strokeWidth="7" strokeLinejoin="round"/><path d="M370 151h70" stroke="#8a5b3c" strokeWidth="8" strokeLinecap="round"/><path d="m378 154 7 34h37l9-34" fill="none" stroke="#c9d6c5" strokeWidth="3"/>
        <g className="student-scene__player">{student}
          <path d="M226 218q-37 4-48 46m97-45q38 6 55 44" className="student-scene__sleeves"/>
          <circle cx="179" cy="265" r="10" fill="#e6b792"/><circle cx="329" cy="264" r="10" fill="#e6b792"/>
          <path d="M220 303q-23 25-40 60m106-60q27 26 40 60" fill="none" stroke="#1d3949" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="m180 364-22 6m168-6 23 6" stroke="#fff9e9" strokeWidth="12" strokeLinecap="round"/>
          <text x="251" y="277" textAnchor="middle" fill="#f5efda" fontFamily="Georgia" fontSize="28" fontWeight="bold">N</text>
        </g>
        <g className="student-scene__basketball"><circle cx="347" cy="306" r="29" fill="#b97b4d" stroke="#76553e" strokeWidth="4"/><path d="M320 306h54m-27-28v56m-18-45q27 17 35 32m-36 0q25-17 36-32" fill="none" stroke="#76553e" strokeWidth="3"/></g>
      </>;
      case 'debating': return <>
        <path d="M64 371h393" className="student-scene__ground"/>
        <g transform="translate(-19 -7)">{student}</g>
        <path d="M204 236q-35 25-47 53m105-70q40-10 53-51" className="student-scene__sleeves"/>
        <circle cx="315" cy="167" r="10" fill="#e6b792"/>
        <path d="M166 251h192l-26 29H189Z" fill="#d9c293" stroke="#9b805b" strokeWidth="4"/><path d="M196 278h132l15 92H181Z" fill="#315963" stroke="#193b48" strokeWidth="4"/><circle cx="262" cy="318" r="16" fill="#d7c590"/><text x="262" y="324" textAnchor="middle" fill="#25444d" fontSize="18" fontFamily="Georgia">N</text>
        <g className="student-scene__speech"><path d="M340 85h96q19 0 19 18v31q0 18-19 18h-44l-23 19v-19h-29q-16 0-16-18v-31q0-18 16-18Z" fill="#fff8e9" stroke="#bca876" strokeWidth="3"/><path d="M349 111h80m-80 16h60" stroke="#75948d" strokeWidth="5" strokeLinecap="round"/></g>
      </>;
      case 'rowing': return <>
        <path d="M22 347q30-12 60 0t60 0 60 0 60 0 60 0 60 0 60 0 60 0" fill="none" stroke="#669b9c" strokeWidth="6" strokeLinecap="round"/><path d="M24 369q30-12 60 0t60 0 60 0 60 0 60 0 60 0 60 0 60 0" fill="none" stroke="#8fb8ad" strokeWidth="5" strokeLinecap="round"/>
        <g transform="translate(0 27)">{student}</g>
        <path d="M224 240q-39 6-52 46m100-49q43 1 62 39" className="student-scene__sleeves"/><circle cx="173" cy="283" r="10" fill="#e6b792"/><circle cx="334" cy="275" r="10" fill="#e6b792"/>
        <path d="M82 298h354q-20 54-74 57H152q-50-5-70-57Z" fill="#214752" stroke="#d5c39c" strokeWidth="5"/>
        <g className="student-scene__oar"><path d="M178 283 389 380" stroke="#af8756" strokeWidth="8" strokeLinecap="round"/><path d="m386 372 40 16-20 18-34-23Z" fill="#d3ba88"/></g>
      </>;
      case 'rugby': return <>
        <path d="M40 367h440" className="student-scene__ground"/>
        <g className="student-scene__runner" transform="translate(12 -4) rotate(9 252 240)">{student}
          <path d="M220 217q-29 3-48 46m100-51q33 5 45 43" className="student-scene__sleeves"/>
          <circle cx="173" cy="263" r="10" fill="#e6b792"/><circle cx="318" cy="254" r="10" fill="#e6b792"/>
          <path d="M218 301q-23 31-46 55m115-55q24 32 60 51" fill="none" stroke="#1e3c4c" strokeWidth="23" strokeLinecap="round"/><path d="m172 356-25 9m200-13 26 8" stroke="#fff9e9" strokeWidth="13" strokeLinecap="round"/>
        </g><g className="student-scene__ball"><ellipse cx="337" cy="249" rx="36" ry="22" transform="rotate(-27 337 249)" fill="#a87546" stroke="#684d37" strokeWidth="4"/><path d="m316 259 43-21m-21-4 11 23m-28-17 11 25" stroke="#fff9e9" strokeWidth="4"/></g>
        <path d="M425 340v-150m-35 0h70" fill="none" stroke="#d6caab" strokeWidth="6" strokeLinecap="round"/>
      </>;
      case 'polo': return <>
        <path d="M32 369h459" className="student-scene__ground"/>
        <g className="student-scene__horse"><path d="M115 262q28-62 132-54l75 31 42-33 33 17-13 55-43 16-24-20-27 61H159l-15-47Z" fill="#b79267" stroke="#775e48" strokeWidth="5" strokeLinejoin="round"/><path d="m377 218 35-21 19 10-12 27-31 15" fill="#b79267" stroke="#775e48" strokeWidth="4"/><circle cx="395" cy="219" r="3" fill="#1d3949"/><path d="M163 324 146 368m54-37 4 38m80-38 27 38m25-52 48 50" stroke="#775e48" strokeWidth="15" strokeLinecap="round"/><path d="M114 249q-35 4-41 46" fill="none" stroke="#775e48" strokeWidth="11" strokeLinecap="round"/></g>
        <g transform="translate(-11 -64) scale(.82  .82) translate(62 48)">{student}</g>
        <path d="M234 179q-23 13-32 53m47-31q24 13 29 43" fill="none" stroke="#256b67" strokeWidth="18" strokeLinecap="round"/>
        <g className="student-scene__mallet"><path d="M277 243 337 101" stroke="#d3bd92" strokeWidth="7" strokeLinecap="round"/><path d="m321 93 37 16" stroke="#775e48" strokeWidth="13" strokeLinecap="round"/></g>
        <circle cx="412" cy="348" r="12" fill="#f4e8c4" stroke="#bdad84" strokeWidth="3"/>
      </>;
      case 'soccer': return <>
        <path d="M38 373h440" className="student-scene__ground"/><path d="M390 230v127h76V230m-76 0h76" fill="none" stroke="#dbe9d8" strokeWidth="5"/><path d="m390 230 76 127m0-127-76 127" stroke="#dbe9d8" strokeWidth="2" opacity=".6"/>
        <g className="student-scene__runner" transform="translate(-19 -1) rotate(-6 252 240)">{student}<path d="M223 219q-37 5-51 46m103-45q36 9 47 47" className="student-scene__sleeves"/><path d="M212 301q-17 35-38 63m116-62q19 30 47 49" fill="none" stroke="#1d3949" strokeWidth="23" strokeLinecap="round"/><path d="m174 365-25 8m163-20 25 1" stroke="#fff9e9" strokeWidth="13" strokeLinecap="round"/></g>
        <g className="student-scene__soccer-ball"><circle cx="365" cy="348" r="24" fill="#fffdf4" stroke="#244653" strokeWidth="3"/><path d="m365 336 11 8-4 14h-14l-4-14Zm-23 6 12 2m22 0 12-3m-16 17 5 11m-20-11-7 10" fill="#244653" stroke="#244653" strokeWidth="2"/></g>
      </>;
      case 'camping': return <>
        <path d="M27 372h462" className="student-scene__ground"/><path d="m302 344 85-175 88 175Z" fill="#d3bf91" stroke="#af9a72" strokeWidth="4"/><path d="m365 344 22-175 30 175Z" fill="#47766e"/><path d="M375 344q13-40 30 0" fill="#193c47"/>
        <path d="M106 349V174m0 45-33-34m33 18 35-40" stroke="#4f7160" strokeWidth="12" strokeLinecap="round"/><path d="M106 176q-43-52-64 7 14 33 64 14 41 28 70-21-26-59-70 0Z" fill="#749787"/>
        <g className="student-scene__hiker" transform="translate(-62 16) scale(.92)">{student}<path d="M211 215q-31 10-44 49m105-46q28 9 42 50" className="student-scene__sleeves"/><path d="M216 302q-20 35-22 66m91-66q13 39 27 66" fill="none" stroke="#1d3949" strokeWidth="22" strokeLinecap="round"/><path d="m194 369-22 4m140-4 23 4" stroke="#fff9e9" strokeWidth="12" strokeLinecap="round"/><path d="M198 212q-34-1-38 28v47h45" fill="#d6b779" stroke="#806b4e" strokeWidth="4"/></g>
        <g className="student-scene__campfire"><path d="m235 360 35-36 32 36" fill="none" stroke="#806b4e" strokeWidth="9" strokeLinecap="round"/><path d="M269 348q-29-27-8-48 5 17 13 15 3-15 13-22 24 34-5 56Z" fill="#e1ac6e"/><path d="M270 345q-10-12 2-23 11 12 7 23Z" fill="#f3df9e"/></g>
      </>;
    }
  })();

  return <svg className="student-scene" data-activity={activity} viewBox="0 0 520 430" role="img" aria-label={`Student ${activity}`} xmlns="http://www.w3.org/2000/svg">
    <circle cx="260" cy="215" r="202" fill="#d8e9db" opacity=".75" />
    <circle cx="260" cy="215" r="178" fill="#edf4e7" opacity=".58" />
    <path d="M35 374q225 30 450 0" fill="none" stroke="#9fc4af" strokeWidth="3" opacity=".55" />
    {scene}
  </svg>;
}
