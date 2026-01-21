(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function n(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(a){if(a.ep)return;a.ep=!0;const s=n(a);fetch(a.href,s)}})();const _t=[{id:8,name:"6e Klasse",minAttr:5,maxAttr:35,avgAttr:20,budget:5e3,salary:{min:0,avg:50,max:200},ticketPrice:4},{id:7,name:"5e Klasse",minAttr:10,maxAttr:45,avgAttr:28,budget:15e3,salary:{min:25,avg:100,max:400},ticketPrice:5},{id:6,name:"4e Klasse",minAttr:15,maxAttr:55,avgAttr:35,budget:4e4,salary:{min:50,avg:200,max:800},ticketPrice:7},{id:5,name:"3e Klasse",minAttr:20,maxAttr:65,avgAttr:43,budget:1e5,salary:{min:100,avg:400,max:1500},ticketPrice:10},{id:4,name:"2e Klasse",minAttr:30,maxAttr:75,avgAttr:52,budget:3e5,salary:{min:200,avg:800,max:3e3},ticketPrice:12},{id:3,name:"1e Klasse",minAttr:40,maxAttr:82,avgAttr:61,budget:1e6,salary:{min:500,avg:2e3,max:7500},ticketPrice:15},{id:2,name:"Tweede Divisie",minAttr:50,maxAttr:88,avgAttr:69,budget:5e6,salary:{min:2e3,avg:7500,max:25e3},ticketPrice:22},{id:1,name:"Eerste Divisie",minAttr:60,maxAttr:93,avgAttr:76,budget:2e7,salary:{min:7500,avg:25e3,max:1e5},ticketPrice:32},{id:0,name:"Eredivisie",minAttr:70,maxAttr:99,avgAttr:84,budget:1e8,salary:{min:25e3,avg:1e5,max:5e5},ticketPrice:50}],Q=[{code:"NL",name:"Nederlands",flag:"🇳🇱",bonus:{VER:3,passing:5}},{code:"BE",name:"Belgisch",flag:"🇧🇪",bonus:{AAN:4,FYS:4}},{code:"DE",name:"Duits",flag:"🇩🇪",bonus:{FYS:5,discipline:3}},{code:"BR",name:"Braziliaans",flag:"🇧🇷",bonus:{SNE:7,VER:-2}},{code:"AR",name:"Argentijns",flag:"🇦🇷",bonus:{AAN:5,passion:3}},{code:"ES",name:"Spaans",flag:"🇪🇸",bonus:{AAN:5,passing:5}},{code:"GB",name:"Engels",flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",bonus:{FYS:5,heading:3}},{code:"FR",name:"Frans",flag:"🇫🇷",bonus:{SNE:5,AAN:3}},{code:"PT",name:"Portugees",flag:"🇵🇹",bonus:{SNE:5,dribbling:3}},{code:"IT",name:"Italiaans",flag:"🇮🇹",bonus:{VER:5,tactical:3}},{code:"PL",name:"Pools",flag:"🇵🇱",bonus:{FYS:4,VER:3}},{code:"HR",name:"Kroatisch",flag:"🇭🇷",bonus:{AAN:5,VER:2}},{code:"RS",name:"Servisch",flag:"🇷🇸",bonus:{FYS:4,AAN:3}},{code:"DK",name:"Deens",flag:"🇩🇰",bonus:{FYS:4,teamwork:3}},{code:"SE",name:"Zweeds",flag:"🇸🇪",bonus:{FYS:5,SNE:2}},{code:"NO",name:"Noors",flag:"🇳🇴",bonus:{FYS:5,stamina:3}},{code:"GH",name:"Ghanees",flag:"🇬🇭",bonus:{SNE:5,FYS:3}},{code:"NG",name:"Nigeriaans",flag:"🇳🇬",bonus:{SNE:5,AAN:3}},{code:"CM",name:"Kameroens",flag:"🇨🇲",bonus:{FYS:5,SNE:3}},{code:"MA",name:"Marokkaans",flag:"🇲🇦",bonus:{SNE:5,AAN:3}},{code:"TR",name:"Turks",flag:"🇹🇷",bonus:{passion:5,AAN:3}},{code:"JP",name:"Japans",flag:"🇯🇵",bonus:{SNE:5,discipline:5}},{code:"KR",name:"Zuid-Koreaans",flag:"🇰🇷",bonus:{stamina:5,discipline:3}},{code:"US",name:"Amerikaans",flag:"🇺🇸",bonus:{FYS:4,SNE:3}}],S={keeper:{name:"Keeper",abbr:"KEE",color:"#f9a825",group:"goalkeeper",weights:{REF:.45,BAL:.3,SNE:.15,FYS:.1}},linksback:{name:"Linksback",abbr:"LB",color:"#2196f3",group:"defender",weights:{VER:.35,SNE:.3,FYS:.25,AAN:.1}},centraleVerdediger:{name:"Centrale Verdediger",abbr:"CV",color:"#1976d2",group:"defender",weights:{VER:.45,FYS:.35,SNE:.15,AAN:.05}},rechtsback:{name:"Rechtsback",abbr:"RB",color:"#2196f3",group:"defender",weights:{VER:.35,SNE:.3,FYS:.25,AAN:.1}},linksMid:{name:"Links Middenvelder",abbr:"LM",color:"#4caf50",group:"midfielder",weights:{SNE:.3,AAN:.3,VER:.2,FYS:.2}},centraleMid:{name:"Centrale Middenvelder",abbr:"CM",color:"#4caf50",group:"midfielder",weights:{VER:.3,AAN:.3,FYS:.2,SNE:.2}},rechtsMid:{name:"Rechts Middenvelder",abbr:"RM",color:"#4caf50",group:"midfielder",weights:{SNE:.3,AAN:.3,VER:.2,FYS:.2}},linksbuiten:{name:"Linksbuiten",abbr:"LW",color:"#9c27b0",group:"attacker",weights:{SNE:.35,AAN:.35,FYS:.15,VER:.15}},rechtsbuiten:{name:"Rechtsbuiten",abbr:"RW",color:"#9c27b0",group:"attacker",weights:{SNE:.35,AAN:.35,FYS:.15,VER:.15}},spits:{name:"Spits",abbr:"ST",color:"#9c27b0",group:"attacker",weights:{AAN:.45,SNE:.25,FYS:.2,VER:.1}}},it={keeper:{REF:{name:"Katachtige Keeper",bonus:{reflexes:15,diving:10}},BAL:{name:"Veilige Keeper",bonus:{catching:12,positioning:8}},SNE:{name:"Sweeper-Keeper",bonus:{saves_outside:10,rushing:8}},FYS:{name:"Kolos-Keeper",bonus:{aerial:15,intimidation:10}}},linksback:{SNE:{name:"Snelle Back",bonus:{pace:12,crossing:8}},VER:{name:"Defensieve Back",bonus:{tackling:10,positioning:8}},AAN:{name:"Aanvallende Back",bonus:{crossing:12,assists:10}},FYS:{name:"Fysieke Back",bonus:{stamina:10,strength:8}}},centraleVerdediger:{FYS:{name:"Kolos",bonus:{heading:15,tackling:10}},VER:{name:"Muur",bonus:{positioning:12,tackling:8}},SNE:{name:"Snelle Verdediger",bonus:{pace:10,interception:8}},AAN:{name:"Opbouwende Verdediger",bonus:{passing:12,longballs:8}}},rechtsback:{SNE:{name:"Snelle Back",bonus:{pace:12,crossing:8}},VER:{name:"Defensieve Back",bonus:{tackling:10,positioning:8}},AAN:{name:"Aanvallende Back",bonus:{crossing:12,assists:10}},FYS:{name:"Fysieke Back",bonus:{stamina:10,strength:8}}},linksMid:{SNE:{name:"Snelle Vleugelspeler",bonus:{pace:12,dribbling:8}},VER:{name:"Verdedigende Vleugelspeler",bonus:{tackling:10,positioning:8}},AAN:{name:"Aanvallende Vleugelspeler",bonus:{assists:12,crossing:10}},FYS:{name:"Fysieke Vleugelspeler",bonus:{stamina:12,strength:8}}},centraleMid:{VER:{name:"Destroyer",bonus:{interception:15,tackling:10}},FYS:{name:"Box-to-Box",bonus:{stamina:10,allround:8}},SNE:{name:"Dynamische Middenvelder",bonus:{dribbling:10,pressing:8}},AAN:{name:"Aanvallende Middenvelder",bonus:{shooting:12,positioning:8}}},rechtsMid:{SNE:{name:"Snelle Vleugelspeler",bonus:{pace:12,dribbling:8}},VER:{name:"Verdedigende Vleugelspeler",bonus:{tackling:10,positioning:8}},AAN:{name:"Aanvallende Vleugelspeler",bonus:{assists:12,crossing:10}},FYS:{name:"Fysieke Vleugelspeler",bonus:{stamina:12,strength:8}}},linksbuiten:{SNE:{name:"Snelle Vleugelspits",bonus:{pace:15,counter:10}},AAN:{name:"Doelgerichte Buitenspeler",bonus:{finishing:12,cutting_inside:8}},FYS:{name:"Fysieke Buitenspeler",bonus:{strength:10,heading:8}},VER:{name:"Hardwerkende Buitenspeler",bonus:{pressing:10,tackling:6}}},rechtsbuiten:{SNE:{name:"Snelle Vleugelspits",bonus:{pace:15,counter:10}},AAN:{name:"Doelgerichte Buitenspeler",bonus:{finishing:12,cutting_inside:8}},FYS:{name:"Fysieke Buitenspeler",bonus:{strength:10,heading:8}},VER:{name:"Hardwerkende Buitenspeler",bonus:{pressing:10,tackling:6}}},spits:{FYS:{name:"Bonkige Spits",bonus:{heading:15,holdup:12}},SNE:{name:"Snelle Spits",bonus:{counter:15,pace:10}},AAN:{name:"Doelpuntenmachine",bonus:{finishing:18,positioning:5}},VER:{name:"Hardwerkende Spits",bonus:{pressing:12,holdup:8}}}},U={good:["Leider","Professional","Loyaal","Mentor","Perfectionist"],neutral:["Ambitieus","Verlegen","Einzelganger"],bad:["Feestbeest","Lui","Arrogant","Temperamentvol","Geldwolf"]},$e=["Jan","Pieter","Henk","Klaas","Willem","Sander","Thijs","Daan","Lars","Jesse","Joris","Bram","Niels","Jeroen","Martijn","Kevin","Stefan","Dennis","Tim","Bas","Rick","Robin","Mark","Erik","Ruben","Tom","Mike","Jens","Frank","Wouter","Mohammed","Ahmed","Youssef","Ibrahim","Omar","Lucas","Noah","Finn","Sem","Levi"],Te=["de Jong","Jansen","de Vries","van den Berg","Bakker","Visser","Smit","Meijer","de Boer","Mulder","de Groot","Bos","Vos","Peters","Hendriks","van Dijk","Vermeer","Dekker","Brouwer","de Wit","Dijkstra","Koster","Willems","van Leeuwen","El Amrani","Özdemir","Silva","Santos","Garcia","Martinez","Andersen","Nielsen"],Ke={mentality:[{id:"defensive",name:"Verdedigend",icon:"🛡️",effect:{defense:15,attack:-10}},{id:"balanced",name:"Gebalanceerd",icon:"⚖️",effect:{defense:0,attack:0}},{id:"attacking",name:"Aanvallend",icon:"⚔️",effect:{defense:-10,attack:15}},{id:"ultra_attacking",name:"Ultra Aanvallend",icon:"🔥",effect:{defense:-20,attack:25}}],pressing:[{id:"low",name:"Laag Blok",icon:"📉",effect:{stamina:10,pressing:-15}},{id:"medium",name:"Medium Druk",icon:"📊",effect:{stamina:0,pressing:0}},{id:"high",name:"Hoge Druk",icon:"📈",effect:{stamina:-15,pressing:20}},{id:"gegenpressing",name:"Gegenpressing",icon:"⚡",effect:{stamina:-25,pressing:30,recovery:20}}]},Ae={fysio:{name:"Fysiotherapeut",icon:"🏥",description:"Versnelt herstel van blessures",effect:"Herstel -25%",minDivision:5,cost:500,weeklySalary:150},scout:{name:"Talentscout",icon:"🔭",description:"Verhoogt kans op succesvolle scouts",effect:"Scout +15%",minDivision:5,cost:750,weeklySalary:200},dokter:{name:"Clubarts",icon:"👨‍⚕️",description:"Vermindert kans op blessures",effect:"Blessure -20%",minDivision:5,cost:1e3,weeklySalary:250}},at={attacking:{name:"Aanvallende Assistent",icon:"⚔️",description:"Specialist in aanvallend spel",effect:"+20% AAN training",boostStats:["AAN"],boostAmount:.2,cost:300,weeklySalary:100},defensive:{name:"Verdedigende Assistent",icon:"🛡️",description:"Specialist in verdedigend spel",effect:"+20% VER training",boostStats:["VER"],boostAmount:.2,cost:300,weeklySalary:100},technical:{name:"Aanvalsassistent",icon:"⚽",description:"Verbetert aanvallend inzicht",effect:"+20% AAN training",boostStats:["AAN"],boostAmount:.2,cost:400,weeklySalary:120},physical:{name:"Conditietrainer",icon:"💪",description:"Focust op fysieke ontwikkeling",effect:"+15% SNE & FYS training",boostStats:["SNE","FYS"],boostAmount:.15,cost:350,weeklySalary:110}},H={"4-4-2":{name:"4-4-2 Klassiek",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:15,y:72,role:"linksback",name:"LB"},{x:38,y:76,role:"centraleVerdediger",name:"CV"},{x:62,y:76,role:"centraleVerdediger",name:"CV"},{x:85,y:72,role:"rechtsback",name:"RB"},{x:15,y:48,role:"linksbuiten",name:"LW"},{x:38,y:52,role:"centraleMid",name:"CM"},{x:62,y:52,role:"centraleMid",name:"CM"},{x:85,y:48,role:"rechtsbuiten",name:"RW"},{x:35,y:24,role:"spits",name:"ST"},{x:65,y:24,role:"spits",name:"ST"}],idealTags:["Box-to-Box","Snelle Vleugelspits","Doelpuntenmachine","Bonkige Spits"]},"4-3-3":{name:"4-3-3 Aanvallend",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:15,y:72,role:"linksback",name:"LB"},{x:38,y:76,role:"centraleVerdediger",name:"CV"},{x:62,y:76,role:"centraleVerdediger",name:"CV"},{x:85,y:72,role:"rechtsback",name:"RB"},{x:30,y:52,role:"centraleMid",name:"CM"},{x:50,y:48,role:"centraleMid",name:"CM"},{x:70,y:52,role:"centraleMid",name:"CM"},{x:18,y:26,role:"linksbuiten",name:"LW"},{x:50,y:18,role:"spits",name:"ST"},{x:82,y:26,role:"rechtsbuiten",name:"RW"}],idealTags:["Spelmaker","Destroyer","Snelle Vleugelspits","Doelpuntenmachine"]},"4-2-3-1":{name:"4-2-3-1",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:15,y:72,role:"linksback",name:"LB"},{x:38,y:76,role:"centraleVerdediger",name:"CV"},{x:62,y:76,role:"centraleVerdediger",name:"CV"},{x:85,y:72,role:"rechtsback",name:"RB"},{x:35,y:56,role:"centraleMid",name:"CM"},{x:65,y:56,role:"centraleMid",name:"CM"},{x:18,y:36,role:"linksbuiten",name:"LW"},{x:50,y:32,role:"centraleMid",name:"CM"},{x:82,y:36,role:"rechtsbuiten",name:"RW"},{x:50,y:16,role:"spits",name:"ST"}],idealTags:["Destroyer","Spelmaker","Technische Buitenspeler","Doelpuntenmachine"]},"3-5-2":{name:"3-5-2 Wingbacks",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:30,y:76,role:"centraleVerdediger",name:"CV"},{x:50,y:78,role:"centraleVerdediger",name:"CV"},{x:70,y:76,role:"centraleVerdediger",name:"CV"},{x:8,y:50,role:"linksback",name:"LB"},{x:30,y:52,role:"centraleMid",name:"CM"},{x:50,y:48,role:"centraleMid",name:"CM"},{x:70,y:52,role:"centraleMid",name:"CM"},{x:92,y:50,role:"rechtsback",name:"RB"},{x:35,y:22,role:"spits",name:"ST"},{x:65,y:22,role:"spits",name:"ST"}],idealTags:["Kolos","Aanvallende Back","Box-to-Box","Bonkige Spits"]},"5-3-2":{name:"5-3-2 Verdedigend",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:10,y:68,role:"linksback",name:"LB"},{x:30,y:76,role:"centraleVerdediger",name:"CV"},{x:50,y:78,role:"centraleVerdediger",name:"CV"},{x:70,y:76,role:"centraleVerdediger",name:"CV"},{x:90,y:68,role:"rechtsback",name:"RB"},{x:30,y:48,role:"centraleMid",name:"CM"},{x:50,y:52,role:"centraleMid",name:"CM"},{x:70,y:48,role:"centraleMid",name:"CM"},{x:35,y:22,role:"spits",name:"ST"},{x:65,y:22,role:"spits",name:"ST"}],idealTags:["Muur","Kolos","Destroyer","Bonkige Spits"]},"4-1-4-1":{name:"4-1-4-1 Holding",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:15,y:72,role:"linksback",name:"LB"},{x:38,y:76,role:"centraleVerdediger",name:"CV"},{x:62,y:76,role:"centraleVerdediger",name:"CV"},{x:85,y:72,role:"rechtsback",name:"RB"},{x:50,y:58,role:"centraleMid",name:"CM"},{x:15,y:40,role:"linksbuiten",name:"LW"},{x:38,y:44,role:"centraleMid",name:"CM"},{x:62,y:44,role:"centraleMid",name:"CM"},{x:85,y:40,role:"rechtsbuiten",name:"RW"},{x:50,y:18,role:"spits",name:"ST"}],idealTags:["Destroyer","Spelmaker","Snelle Vleugelspits","Doelpuntenmachine"]},"3-4-3":{name:"3-4-3 Totaal Voetbal",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:30,y:74,role:"centraleVerdediger",name:"CV"},{x:50,y:76,role:"centraleVerdediger",name:"CV"},{x:70,y:74,role:"centraleVerdediger",name:"CV"},{x:10,y:48,role:"linksback",name:"LB"},{x:38,y:52,role:"centraleMid",name:"CM"},{x:62,y:52,role:"centraleMid",name:"CM"},{x:90,y:48,role:"rechtsback",name:"RB"},{x:22,y:22,role:"linksbuiten",name:"LW"},{x:50,y:18,role:"spits",name:"ST"},{x:78,y:22,role:"rechtsbuiten",name:"RW"}],idealTags:["Elegante Verdediger","Aanvallende Back","Spelmaker","Snelle Vleugelspits"]},"4-4-2-diamond":{name:"4-4-2 Diamant",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:15,y:72,role:"linksback",name:"LB"},{x:38,y:76,role:"centraleVerdediger",name:"CV"},{x:62,y:76,role:"centraleVerdediger",name:"CV"},{x:85,y:72,role:"rechtsback",name:"RB"},{x:50,y:58,role:"centraleMid",name:"CM"},{x:28,y:44,role:"centraleMid",name:"CM"},{x:72,y:44,role:"centraleMid",name:"CM"},{x:50,y:32,role:"centraleMid",name:"CM"},{x:35,y:18,role:"spits",name:"ST"},{x:65,y:18,role:"spits",name:"ST"}],idealTags:["Destroyer","Box-to-Box","Spelmaker","Technische Spits"]}},z={tribunes:[{id:"tribune_1",name:"Houten Bankjes",capacity:200,cost:0,buildTime:0,maintenance:10,required:0},{id:"tribune_2",name:"Betonnen Tribune",capacity:500,cost:15e3,buildTime:7,maintenance:25,required:0},{id:"tribune_3",name:"Tribune met Dak",capacity:1e3,cost:35e3,buildTime:14,maintenance:50,required:500},{id:"tribune_4",name:"Overdekte Tribune",capacity:2e3,cost:1e5,buildTime:21,maintenance:100,required:1e3},{id:"tribune_5",name:"Dubbele Tribune",capacity:4e3,cost:25e4,buildTime:30,maintenance:200,required:2e3},{id:"tribune_6",name:"Hoefijzer Stadion",capacity:6e3,cost:45e4,buildTime:45,maintenance:350,required:4e3},{id:"tribune_7",name:"Modern Stadion",capacity:1e4,cost:8e5,buildTime:60,maintenance:500,required:6e3},{id:"tribune_8",name:"Professioneel Stadion",capacity:18e3,cost:2e6,buildTime:90,maintenance:900,required:1e4},{id:"tribune_9",name:"Groot Stadion",capacity:3e4,cost:5e6,buildTime:120,maintenance:1500,required:18e3},{id:"tribune_10",name:"Arena",capacity:45e3,cost:12e6,buildTime:180,maintenance:3e3,required:3e4},{id:"tribune_11",name:"Super Arena",capacity:55e3,cost:25e6,buildTime:240,maintenance:5e3,required:45e3},{id:"tribune_12",name:"Nationaal Stadion",capacity:7e4,cost:5e7,buildTime:365,maintenance:8e3,required:55e3}],grass:[{id:"grass_0",name:"Basis Grasveld",effect:"Standaard veldslijtage",cost:0,buildTime:0,required:0},{id:"grass_1",name:"Onderhouden Gras",effect:"-20% veldslijtage",cost:5e3,buildTime:3,required:0},{id:"grass_2",name:"Semi-Pro Gras",effect:"-40% veldslijtage, +5% passing",cost:2e4,buildTime:7,required:1e3},{id:"grass_3",name:"Professioneel Gras",effect:"-60% veldslijtage, +10% passing",cost:75e3,buildTime:14,required:4e3},{id:"grass_4",name:"Hybride Gras",effect:"-80% veldslijtage, +15% passing",cost:2e5,buildTime:21,required:1e4},{id:"grass_5",name:"Stadium Turf",effect:"Geen slijtage, +20% passing",cost:5e5,buildTime:30,required:25e3}],horeca:[{id:"horeca_1",name:"Koffiekar",income:.2,cost:1e3,buildTime:1,required:0},{id:"horeca_2",name:"Frietkraam",income:.5,cost:5e3,buildTime:3,required:0},{id:"horeca_3",name:"Drankstand",income:.4,cost:3e3,buildTime:2,required:0},{id:"horeca_4",name:"Bierkraam",income:.8,cost:8e3,buildTime:5,required:500},{id:"horeca_5",name:"Snackbar",income:1.2,cost:15e3,buildTime:7,required:500},{id:"horeca_6",name:"Hamburger Stand",income:1,cost:12e3,buildTime:5,required:1e3},{id:"horeca_7",name:"Pizza Corner",income:1.3,cost:18e3,buildTime:7,required:2e3},{id:"horeca_8",name:"Restaurant Basis",income:2.5,cost:5e4,buildTime:14,required:2e3},{id:"horeca_9",name:"Food Court",income:3,cost:15e4,buildTime:21,required:6e3},{id:"horeca_10",name:"Premium Restaurant",income:5,cost:3e5,buildTime:30,required:1e4},{id:"horeca_11",name:"Michelin Restaurant",income:8,cost:75e4,buildTime:45,required:3e4},{id:"horeca_12",name:"Hospitality Village",income:12,cost:15e5,buildTime:60,required:45e3}],fanshop:[{id:"shop_1",name:"Verkooptafel",income:.2,cost:1e3,buildTime:1,required:0},{id:"shop_2",name:"Merchandise Kraam",income:.3,cost:2e3,buildTime:1,required:0},{id:"shop_3",name:"Kleine Fanshop",income:.8,cost:1e4,buildTime:5,required:500},{id:"shop_4",name:"Fanshop Standaard",income:1.5,cost:35e3,buildTime:10,required:2e3},{id:"shop_5",name:"Grote Fanshop",income:2.5,cost:1e5,buildTime:20,required:6e3},{id:"shop_6",name:"Megastore",income:4,cost:3e5,buildTime:35,required:18e3},{id:"shop_7",name:"Flagship Store",income:6,cost:75e4,buildTime:45,required:3e4},{id:"shop_8",name:"Online Shop",dailyIncome:500,cost:5e4,buildTime:7,required:2e3},{id:"shop_9",name:"Webshop Premium",dailyIncome:2e3,cost:2e5,buildTime:14,required:1e4},{id:"shop_10",name:"E-Commerce Platform",dailyIncome:8e3,cost:8e5,buildTime:30,required:3e4}],vip:[{id:"vip_1",name:"Business Seats",capacity:30,pricePerSeat:20,cost:5e4,buildTime:14,required:2e3},{id:"vip_2",name:"Business Seats+",capacity:60,pricePerSeat:25,cost:1e5,buildTime:21,required:4e3},{id:"vip_3",name:"Skybox Klein",capacity:15,pricePerSeat:60,cost:15e4,buildTime:21,required:6e3},{id:"vip_4",name:"Skybox Standaard",capacity:30,pricePerSeat:75,cost:3e5,buildTime:30,required:1e4},{id:"vip_5",name:"Skybox Premium",capacity:50,pricePerSeat:100,cost:5e5,buildTime:35,required:18e3},{id:"vip_6",name:"Executive Lounge",capacity:80,pricePerSeat:125,cost:8e5,buildTime:45,required:25e3},{id:"vip_7",name:"VIP Village",capacity:150,pricePerSeat:175,cost:15e5,buildTime:60,required:35e3},{id:"vip_8",name:"Platinum Lounge",capacity:200,pricePerSeat:250,cost:3e6,buildTime:75,required:45e3},{id:"vip_9",name:"Directors Box",capacity:50,pricePerSeat:500,cost:5e6,buildTime:90,required:55e3}],parking:[{id:"parking_1",name:"Grasveld",capacity:50,pricePerCar:1,cost:2e3,buildTime:2,required:0},{id:"parking_2",name:"Gravel Parkeren",capacity:100,pricePerCar:2,cost:1e4,buildTime:5,required:500},{id:"parking_3",name:"Verhard Terrein",capacity:200,pricePerCar:3,cost:25e3,buildTime:10,required:1e3},{id:"parking_4",name:"Parkeerplaats Klein",capacity:400,pricePerCar:4,cost:75e3,buildTime:20,required:4e3},{id:"parking_5",name:"Parkeerplaats Groot",capacity:800,pricePerCar:5,cost:2e5,buildTime:30,required:1e4},{id:"parking_6",name:"Parkeergarage",capacity:1500,pricePerCar:7,cost:5e5,buildTime:60,required:2e4},{id:"parking_7",name:"Multi-Parkeergarage",capacity:3e3,pricePerCar:8,cost:12e5,buildTime:90,required:35e3},{id:"parking_8",name:"VIP Parking",capacity:200,pricePerCar:25,cost:4e5,buildTime:30,required:2e4}],lighting:[{id:"light_1",name:"Bouwlampen",effect:"avond",cost:1e4,buildTime:3,required:500},{id:"light_2",name:"Basis Verlichting",effect:"avond+",cost:3e4,buildTime:14,required:1e3},{id:"light_3",name:"Lichtmasten",effect:"+10% sfeer",cost:8e4,buildTime:21,required:4e3},{id:"light_4",name:"Pro Verlichting",effect:"+15% sfeer, TV",cost:2e5,buildTime:30,required:1e4},{id:"light_5",name:"Stadion Verlichting",effect:"+20% sfeer, HD",cost:5e5,buildTime:45,required:25e3},{id:"light_6",name:"LED Systeem",effect:"+25% sfeer, 4K, -30% energie",cost:1e6,buildTime:60,required:4e4}],training:[{id:"train_1",name:"Grasveld",multiplier:1,maxAttr:50,cost:0,buildTime:0,required:0},{id:"train_2",name:"Amateur Veld",multiplier:1.2,maxAttr:60,cost:25e3,buildTime:14,required:0},{id:"train_3",name:"Semi-Pro Complex",multiplier:1.4,maxAttr:70,cost:75e3,buildTime:21,required:1e3},{id:"train_4",name:"Professioneel Complex",multiplier:1.6,maxAttr:80,cost:2e5,buildTime:30,required:4e3},{id:"train_5",name:"Elite Complex",multiplier:1.8,maxAttr:90,cost:5e5,buildTime:45,required:1e4},{id:"train_6",name:"Wereldklasse Complex",multiplier:2,maxAttr:99,cost:1e6,buildTime:60,required:25e3}],medical:[{id:"med_1",name:"Geen",effect:"+50% blessureduur",cost:0,buildTime:0,required:0},{id:"med_2",name:"EHBO Post",effect:"standaard",cost:1e4,buildTime:3,required:0},{id:"med_3",name:"Fysiotherapeut",effect:"-15% blessureduur",cost:35e3,buildTime:7,required:500},{id:"med_4",name:"Medische Kamer",effect:"-25% blessureduur",cost:1e5,buildTime:14,required:2e3},{id:"med_5",name:"Medisch Centrum",effect:"-35% duur, -10% kans",cost:3e5,buildTime:21,required:6e3},{id:"med_6",name:"Elite Faciliteit",effect:"-50% duur, -20% kans",cost:75e4,buildTime:30,required:18e3},{id:"med_7",name:"Sportmedisch Instituut",effect:"-60% duur, -30% kans",cost:15e5,buildTime:45,required:35e3}],academy:[{id:"acad_1",name:"Geen",youthPerMonth:0,maxOverall:0,cost:0,buildTime:0,required:0},{id:"acad_2",name:"Jeugdteam",youthPerMonth:.5,maxOverall:40,cost:25e3,buildTime:14,required:500},{id:"acad_3",name:"Basis Academie",youthPerMonth:1,maxOverall:50,cost:5e4,buildTime:30,required:2e3},{id:"acad_4",name:"Ontwikkelde Academie",youthPerMonth:2,maxOverall:60,cost:15e4,buildTime:45,required:6e3},{id:"acad_5",name:"Pro Academie",youthPerMonth:3,maxOverall:70,cost:4e5,buildTime:60,required:15e3},{id:"acad_6",name:"Elite Academie",youthPerMonth:4,maxOverall:80,cost:1e6,buildTime:90,required:3e4},{id:"acad_7",name:"Wereldklasse Academie",youthPerMonth:5,maxOverall:90,cost:25e5,buildTime:120,required:5e4}],scouting:[{id:"scout_1",name:"Geen",range:"lokaal",info:"overall",cost:0,buildTime:0,required:0},{id:"scout_2",name:"Lokale Scout",range:"regio",info:"3 attributen",cost:15e3,buildTime:5,required:0},{id:"scout_3",name:"Regionale Scouts",range:"Nederland",info:"alle attributen",cost:5e4,buildTime:10,required:1e3},{id:"scout_4",name:"Nationale Scouts",range:"Benelux",info:"+ persoonlijkheid",cost:15e4,buildTime:20,required:4e3},{id:"scout_5",name:"Europese Scouts",range:"Europa",info:"+ potentieel",cost:4e5,buildTime:30,required:15e3},{id:"scout_6",name:"Wereldwijde Scouts",range:"Wereld",info:"alles",cost:1e6,buildTime:45,required:35e3}],sponsoring:[{id:"sponsor_1",name:"Geen",dailyIncome:0,cost:0,buildTime:0,required:0},{id:"sponsor_2",name:"Reclamebord Langs Veld",dailyIncome:50,cost:5e3,buildTime:3,required:0},{id:"sponsor_3",name:"Meerdere Reclameborden",dailyIncome:150,cost:2e4,buildTime:7,required:500},{id:"sponsor_4",name:"LED Borden",dailyIncome:400,cost:75e3,buildTime:14,required:2e3},{id:"sponsor_5",name:"Shirtsponsor",dailyIncome:1e3,cost:2e5,buildTime:21,required:6e3},{id:"sponsor_6",name:"Hoofdsponsor Pakket",dailyIncome:2500,cost:5e5,buildTime:30,required:15e3},{id:"sponsor_7",name:"Naamrechten Stadion",dailyIncome:8e3,cost:2e6,buildTime:60,required:35e3}],kantine:[{id:"kantine_1",name:"Geen",effect:"geen bonus",cost:0,buildTime:0,required:0},{id:"kantine_2",name:"Picknicktafel",effect:"+2% morale",cost:3e3,buildTime:2,required:0},{id:"kantine_3",name:"Basis Kantine",effect:"+5% morale",cost:15e3,buildTime:7,required:500},{id:"kantine_4",name:"Moderne Kantine",effect:"+8% morale",cost:5e4,buildTime:14,required:2e3},{id:"kantine_5",name:"Luxe Kantine",effect:"+12% morale",cost:15e4,buildTime:21,required:6e3},{id:"kantine_6",name:"Restaurant Kwaliteit",effect:"+15% morale, +5% fitness",cost:4e5,buildTime:30,required:15e3}],perszaal:[{id:"pers_1",name:"Geen",effect:"geen bonus",cost:0,buildTime:0,required:0},{id:"pers_2",name:"Interview Hoek",effect:"+1 reputatie/week",cost:1e4,buildTime:5,required:500},{id:"pers_3",name:"Kleine Perszaal",effect:"+2 reputatie/week",cost:4e4,buildTime:10,required:2e3},{id:"pers_4",name:"Media Kamer",effect:"+4 reputatie/week",cost:12e4,buildTime:21,required:6e3},{id:"pers_5",name:"Professionele Perszaal",effect:"+6 reputatie/week",cost:3e5,buildTime:30,required:15e3},{id:"pers_6",name:"Broadcast Studio",effect:"+10 reputatie/week, TV bonus",cost:75e4,buildTime:45,required:3e4}],hotel:[{id:"hotel_1",name:"Geen",effect:"geen bonus",cost:0,buildTime:0,required:0},{id:"hotel_2",name:"Slaapzaal",effect:"+3% fitness recovery",cost:25e3,buildTime:14,required:2e3},{id:"hotel_3",name:"Basis Kamers",effect:"+5% fitness recovery",cost:8e4,buildTime:21,required:6e3},{id:"hotel_4",name:"Comfort Suites",effect:"+8% fitness recovery",cost:2e5,buildTime:30,required:15e3},{id:"hotel_5",name:"Luxe Appartementen",effect:"+12% fitness recovery",cost:5e5,buildTime:45,required:25e3},{id:"hotel_6",name:"Vijfsterren Resort",effect:"+15% fitness, +5% morale",cost:15e5,buildTime:60,required:4e4}]};function _(e){return S[e]?.group||"midfielder"}function g(e,t){return Math.floor(Math.random()*(t-e+1))+e}function T(e){return e[Math.floor(Math.random()*e.length)]}function v(e){return"€"+e.toLocaleString("nl-NL")}function Ot(e){return e.split(" ").map(t=>t[0]).join("").substring(0,2).toUpperCase()}function ee(e){return _t.find(t=>t.id===e)}function Ft(e,t){return t<=19?Math.min(99,e+g(15,35)):t<=23?Math.min(99,e+g(10,25)):t<=27?Math.min(99,e+g(5,15)):t<=30?Math.min(99,e+g(2,8)):Math.min(99,e+g(0,3))}function We(){const e=new Date,t=new Date(e);return t.setHours(24,0,0,0),t.getTime()}function je(e){if(e<=0)return"Nu!";const t=Math.floor(e/(1e3*60*60)),n=Math.floor(e%(1e3*60*60)/(1e3*60)),i=Math.floor(e%(1e3*60)/1e3);return`${String(t).padStart(2,"0")}:${String(n).padStart(2,"0")}:${String(i).padStart(2,"0")}`}let o={club:{name:"FC Goals Maken",division:8,budget:5e3,reputation:10,position:3,colors:{primary:"#1b5e20",secondary:"#f5f0e1",accent:"#ff9800"},settingsChangedThisSeason:!1,stats:{founded:1,titles:0,highestDivision:8,totalGoals:0,totalMatches:0}},manager:{xp:0,level:1},dailyRewards:{lastLogin:null,lastClaimDate:null,streak:0},achievements:{},eventHistory:{events:[],lastEventTime:null},stats:{wins:0,draws:0,losses:0,cleanSheets:0,comebacks:0,hatTricks:0,highestScoreMatch:0,currentUnbeaten:0,currentWinStreak:0,promotions:0,relegationEscapes:0,youthGraduates:0,highestSale:0,sellouts:0,homeWins:0,saturdayMatches:0},activeEvent:null,lastMatch:null,stadium:{tribune:"tribune_1",capacity:200,grass:"grass_0",horeca:[],fanshop:[],vip:[],parking:[],lighting:null,training:"train_1",medical:"med_1",academy:"acad_1",scouting:"scout_1",sponsoring:"sponsor_1",kantine:"kantine_1",perszaal:"pers_1",hotel:"hotel_1"},players:[],youthPlayers:[],lineup:new Array(11).fill(null),formation:"4-4-2",tactics:{mentality:"balanced",pressing:"medium",passingStyle:"mixed",tempo:"normal",width:"normal"},advancedTactics:{keeperPressure:!1,forceSetPieces:!1,fullbackRuns:"outside",marking:"zone",attackDefense:50,duelIntensity:50},specialists:{cornerTaker:null,penaltyTaker:null,freekickTaker:null,captain:null},transferMarket:{players:[],lastRefresh:null},trainers:{attack:1,midfield:1,defense:1,goalkeeper:1,fitness:1},training:{slots:{goalkeeper:{playerId:null,startTime:null,trainerId:null},defender:{playerId:null,startTime:null,trainerId:null},midfielder:{playerId:null,startTime:null,trainerId:null},attacker:{playerId:null,startTime:null,trainerId:null}},trainerStatus:{aan:{busy:!1,assignedSlot:null},ver:{busy:!1,assignedSlot:null},tec:{busy:!1,assignedSlot:null},sne:{busy:!1,assignedSlot:null},fys:{busy:!1,assignedSlot:null}},sessionDuration:360*60*1e3,teamTraining:{selected:null,bonus:null}},season:1,week:1,nextMatch:{opponent:"FC Rivaal",time:Date.now()-1e3},standings:[],scoutSearch:{minAge:16,maxAge:35,position:"all",results:[]},scoutMission:{active:!1,startTime:null,duration:60*1e3,pendingPlayer:null},finances:{history:[4500,4600,4800,4700,4900,5100,5e3]},staff:{fysio:null,scout:null,dokter:null},assistantTrainers:{attacking:null,defensive:null,technical:null,physical:null},sponsor:null,stadiumSponsor:null,scoutingNetwork:"none"},P={player:null,sourceIndex:null,isFromBench:!1};function Ht(){P.player=null,P.sourceIndex=null,P.isFromBench=!1}function st(e){Object.keys(e).forEach(t=>{typeof e[t]=="object"&&e[t]!==null&&!Array.isArray(e[t])?o[t]={...o[t],...e[t]}:o[t]=e[t]})}const me="zaterdagvoetbal_save",zt=3e4;let we=null;function O(e){try{const t={version:"2.0",timestamp:Date.now(),state:e};return localStorage.setItem(me,JSON.stringify(t)),console.log("💾 Game saved!"),!0}catch(t){return console.error("Failed to save game:",t),!1}}function Gt(){try{const e=localStorage.getItem(me);if(!e)return console.log("📂 No save file found"),null;const t=JSON.parse(e);return console.log("📂 Game loaded from",new Date(t.timestamp).toLocaleString("nl-NL")),t.state}catch(e){return console.error("Failed to load game:",e),null}}function Yt(){try{const e=localStorage.getItem(me);if(!e)return null;const t=JSON.parse(e);return{version:t.version,timestamp:t.timestamp,clubName:t.state?.club?.name||"Onbekend",division:t.state?.club?.division||8,season:t.state?.season||1,week:t.state?.week||1}}catch{return null}}function Kt(e){we&&clearInterval(we),we=setInterval(()=>{O(e)},zt),window.addEventListener("beforeunload",()=>{O(e)}),console.log("🔄 Auto-save enabled (every 30 seconds)")}function Wt(e){const t=Yt();if(!t)return null;const n=Date.now(),i=n-t.timestamp,a=Math.floor(i/(1e3*60*60));if(a<1)return null;const s={hoursAway:a,trainingSessions:0,scoutMissionsCompleted:0,injuriesHealed:[],energyRecovered:0,matchesReady:!1};if(e.training.slots){const r=e.training.sessionDuration||216e5;for(const[l,c]of Object.entries(e.training.slots))c.playerId&&c.startTime&&n-c.startTime>=r&&s.trainingSessions++}return e.scoutMission?.active&&e.scoutMission?.startTime&&n-e.scoutMission.startTime>=e.scoutMission.duration&&(s.scoutMissionsCompleted=1),s.energyRecovered=Math.min(a*5,30),e.nextMatch?.time&&n>=e.nextMatch.time&&(s.matchesReady=!0),s}function Ut(e,t){t&&(t.energyRecovered>0&&e.players.forEach(n=>{n.energy=Math.min(100,(n.energy||70)+t.energyRecovered),n.fitness=Math.min(100,(n.fitness||80)+Math.floor(t.energyRecovered/2))}),console.log("⏰ Offline progress applied:",t))}function Jt(e){const t={version:"2.0",timestamp:Date.now(),state:e},n=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),i=URL.createObjectURL(n),a=document.createElement("a");a.href=i,a.download=`zaterdagvoetbal_${e.club.name.replace(/\s+/g,"_")}_${new Date().toISOString().split("T")[0]}.json`,a.click(),URL.revokeObjectURL(i),console.log("📤 Save exported")}function Zt(e){return new Promise((t,n)=>{const i=new FileReader;i.onload=a=>{try{const s=JSON.parse(a.target.result);s.state&&s.version?(localStorage.setItem(me,JSON.stringify(s)),t(s.state)):n(new Error("Invalid save file format"))}catch(s){n(s)}},i.onerror=()=>n(new Error("Failed to read file")),i.readAsText(e)})}const j={GOAL:"goal",SHOT_SAVED:"shot_saved",SHOT_MISSED:"shot_missed",FOUL:"foul",YELLOW_CARD:"yellow_card",RED_CARD:"red_card",INJURY:"injury"},Xt={goal:["{player} schiet binnen! GOAL!","Daar is de {minute}! {player} scoort!","{player} kopt raak! Prachtige goal!","En daar gaat de bal in het net! {player} maakt 'm!","{player} schuift de bal beheerst binnen!","Vanaf de rand van de zestien... {player} SCOORT!","{player} maakt er {score} van!"],shot_saved:["{player} schiet, maar de keeper pakt 'm!","Goeie redding van de keeper op het schot van {player}!","{player} probeert het, maar de doelman redt!","De keeper strekt zich uit en houdt het schot van {player} tegen!"],shot_missed:["{player} schiet naast!","Het schot van {player} gaat over!","{player} mist het doel volledig!","Die had er in gemoeten! {player} schiet wild over!"],foul:["Overtreding van {player}!","{player} gaat te ver door en krijgt een vrije trap tegen!","De scheidsrechter fluit voor een overtreding van {player}!"],yellow_card:["Gele kaart voor {player}!","{player} krijgt geel voor die actie!","De scheidsrechter pakt geel voor {player}!"],red_card:["ROOD! {player} moet eruit!","{player} krijgt de rode kaart! Dat is een domper!","Directe rode kaart voor {player}! Ongelooflijk!"],injury:["{player} blijft liggen! Dat ziet er niet goed uit...","De verzorgers komen het veld op voor {player}!","{player} grijpt naar zijn been. Blessure!"],substitution:["{player} wordt gewisseld voor {sub}.","Wissel: {player} eraf, {sub} erin.","De trainer brengt {sub} voor {player}."],chance:["{player} krijgt een grote kans!","Daar is de kans voor {player}!","{player} komt oog in oog met de keeper!"],corner:["Corner voor {team}!","{player} trapt de corner!","Hoekschop, genomen door {player}!"],penalty:["PENALTY! De scheidsrechter wijst naar de stip!","{player} gaat achter de bal staan voor de penalty..."],save:["Geweldige redding van {player}!","{player} houdt zijn ploeg op de been met een knappe save!","De keeper {player} redt zijn team!"],half_time:["Rust! De stand is {homeScore}-{awayScore}.","Naar de kleedkamer met een {homeScore}-{awayScore} stand!"],full_time:["Het eindsignaal klinkt! {homeScore}-{awayScore}!","Einde wedstrijd: {homeScore}-{awayScore}!"]};function Ce(e,t,n,i){if(!e||e.filter(y=>y!==null).length<11)return{attack:30,defense:30,midfield:30,overall:30};let a=0,s=0,r=0,l=0;const c=H[t];if(!c)return{attack:30,defense:30,midfield:30,overall:30};e.forEach((y,x)=>{if(!y)return;const k=c.positions[x];if(!k)return;const b=k.role,M=S[b]?.group||"midfielder";let $=1;y.position===b?$=1.1:S[y.position]?.group===M?$=.95:$=.75;const A=y.overall*$*(y.fitness/100);switch(M){case"goalkeeper":l+=A;break;case"defender":s+=A;break;case"midfielder":r+=A;break;case"attacker":a+=A;break}});const u=Math.max(1,e.filter((y,x)=>y&&S[c.positions[x]?.role]?.group==="defender").length),d=Math.max(1,e.filter((y,x)=>y&&S[c.positions[x]?.role]?.group==="midfielder").length),f=Math.max(1,e.filter((y,x)=>y&&S[c.positions[x]?.role]?.group==="attacker").length);s=s/u,r=r/d,a=a/f;const p=Ke.mentality.find(y=>y.id===n.mentality)?.effect||{},m=Ke.pressing.find(y=>y.id===n.pressing)?.effect||{};a+=(p.attack||0)/2,s+=(p.defense||0)/2,r+=(m.pressing||0)/4,s=(s*3+l)/4;const h=(a+s+r)/3;return{attack:Math.round(Math.max(1,Math.min(99,a))),defense:Math.round(Math.max(1,Math.min(99,s))),midfield:Math.round(Math.max(1,Math.min(99,r))),goalkeeper:Math.round(Math.max(1,Math.min(99,l))),overall:Math.round(Math.max(1,Math.min(99,h)))}}function Qt(e,t=null){const n={8:["De Zondagsrust","Vv Zaterdagvoetbal","FC Derde Helft","SC Bierpomp","VV De Kansen","FC Buitenspel","SV De Keeper","VV Groen Wit"],7:["SC Sportief","VV Voorwaarts","FC Dynamisch","SV Actief","VV De Toekomst","FC Eendracht","SC Victoria","VV Sparta"],6:["FC Sterken","VV Progressief","SC Ambitie","SV Krachtig","VV Klimmen","FC Opwaarts","SC Stijgers","VV Winnaar"],5:["FC Elite","VV Toppers","SC Kampioen","SV Premier","VV De Beste","FC Gouden Bal","SC Trofee","VV Beker"],4:["FC Professioneel","VV Divisie","SC Competitie","SV Liga","VV Klasse","FC Niveau","SC Standaard","VV Kwaliteit"],3:["FC Sterren","VV Glorie","SC Majesteit","SV Koninglijk","VV Adellijk","FC Prestige","SC Ereklasse","VV Subliem"],2:["FC Ajax B","VV Oranje","SC Leeuwen","SV Nederland","VV Tulp","FC Windmolen","SC Kaas","VV Klompen"],1:["Jong Ajax","Jong PSV","Jong Feyenoord","Jong AZ","Jong Twente","Jong Utrecht","Jong Vitesse","Jong Heerenveen"],0:["Ajax","PSV","Feyenoord","AZ","FC Twente","FC Utrecht","Vitesse","SC Heerenveen"]},i=n[e]||n[8],a=T(i),s={8:{base:25,variance:10},7:{base:35,variance:10},6:{base:45,variance:10},5:{base:52,variance:10},4:{base:60,variance:10},3:{base:68,variance:10},2:{base:76,variance:8},1:{base:84,variance:6},0:{base:90,variance:5}},r=s[e]||s[8],l=r.base+g(-r.variance,r.variance);let c=0;return t!==null&&(t<=2?c=5:t<=4?c=2:t>=7&&(c=-3)),{name:a,strength:{attack:Math.min(99,l+g(-5,5)+c),defense:Math.min(99,l+g(-5,5)+c),midfield:Math.min(99,l+g(-5,5)+c),overall:Math.min(99,l+c)},position:t||g(1,8)}}function en(e,t,n,i,a,s){const r=i?"home":"away",l=i?t:n,c=i?n:t,u=[],d=Math.random()*100,f=l.attack/(l.attack+c.defense)*100;if(d<f){const m=Math.random()*100,h=l.attack/2+g(-10,10);if(m<h*.3){const y=s?ke(s):null,x=s&&Math.random()>.4?tn(s,y):null;u.push({minute:e,type:j.GOAL,team:r,player:y?.name||"Speler",playerId:y?.id,assist:x?.name,assistId:x?.id,commentary:Y("goal",{player:y?.name||"Speler",minute:`${e}'`,score:`${a.home+(i?1:0)}-${a.away+(i?0:1)}`})})}else if(m<h*.6){const y=s?ke(s):null;u.push({minute:e,type:j.SHOT_SAVED,team:r,player:y?.name||"Speler",playerId:y?.id,commentary:Y("shot_saved",{player:y?.name||"Speler"})})}else if(m<h){const y=s?ke(s):null;u.push({minute:e,type:j.SHOT_MISSED,team:r,player:y?.name||"Speler",playerId:y?.id,commentary:Y("shot_missed",{player:y?.name||"Speler"})})}}if(Math.random()<.08){const m=s?T(s.filter(h=>h)):null;if(u.push({minute:e,type:j.FOUL,team:r,player:m?.name||"Speler",playerId:m?.id,commentary:Y("foul",{player:m?.name||"Speler"})}),Math.random()<.25){const h=Math.random()<.05;u.push({minute:e,type:h?j.RED_CARD:j.YELLOW_CARD,team:r,player:m?.name||"Speler",playerId:m?.id,commentary:Y(h?"red_card":"yellow_card",{player:m?.name||"Speler"})})}}if(Math.random()<.01){const m=s?T(s.filter(h=>h)):null;u.push({minute:e,type:j.INJURY,team:r,player:m?.name||"Speler",playerId:m?.id,commentary:Y("injury",{player:m?.name||"Speler"})})}return u}function ke(e){const t=e.filter(s=>s!==null);if(t.length===0)return null;const n=t.map(s=>{let r=1;const l=S[s.position]?.group;return l==="attacker"?r+=4:l==="midfielder"&&(r+=2),r+=(s.attributes?.AAN||50)/25,r}),i=n.reduce((s,r)=>s+r,0);let a=Math.random()*i;for(let s=0;s<t.length;s++)if(a-=n[s],a<=0)return t[s];return t[0]}function tn(e,t){const n=e.filter(r=>r!==null&&r.id!==t?.id);if(n.length===0)return null;const i=n.map(r=>{let l=1;const c=S[r.position]?.group;return c==="midfielder"?l+=3:c==="attacker"&&(l+=2),l+=(r.attributes?.SNE||50)/30,l}),a=i.reduce((r,l)=>r+l,0);let s=Math.random()*a;for(let r=0;r<n.length;r++)if(s-=i[r],s<=0)return n[r];return n[0]}function Y(e,t){const n=Xt[e];if(!n||n.length===0)return"";let i=T(n);for(const[a,s]of Object.entries(t))i=i.replace(new RegExp(`\\{${a}\\}`,"g"),s);return i}function nn(e,t,n,i,a,s=!0){const r={homeTeam:s?e:t,awayTeam:s?t:e,homeScore:0,awayScore:0,events:[],playerRatings:{},manOfTheMatch:null,possession:{home:50,away:50},shots:{home:0,away:0},shotsOnTarget:{home:0,away:0},fouls:{home:0,away:0},cards:{home:{yellow:0,red:0},away:{yellow:0,red:0}}},l=s?Ce(n,i,a):t.strength,c=s?t.strength:Ce(n,i,a);l.attack+=3,l.defense+=3;const u=l.midfield+c.midfield;r.possession.home=Math.round(l.midfield/u*100),r.possession.away=100-r.possession.home,n&&n.filter(m=>m).forEach(m=>{r.playerRatings[m.id]={player:m,rating:6+(Math.random()-.5),goals:0,assists:0,yellowCards:0,redCards:0}});const d=an();for(const m of d){const h={home:r.homeScore,away:r.awayScore},x=Math.random()*100<r.possession.home,k=en(m,l,c,x,h,x&&s?n:null);for(const b of k){r.events.push(b);const M=b.team;b.type===j.GOAL?(M==="home"?r.homeScore++:r.awayScore++,r.shots[M]++,r.shotsOnTarget[M]++,b.playerId&&r.playerRatings[b.playerId]&&(r.playerRatings[b.playerId].goals++,r.playerRatings[b.playerId].rating+=1),b.assistId&&r.playerRatings[b.assistId]&&(r.playerRatings[b.assistId].assists++,r.playerRatings[b.assistId].rating+=.5)):b.type===j.SHOT_SAVED?(r.shots[M]++,r.shotsOnTarget[M]++):b.type===j.SHOT_MISSED?r.shots[M]++:b.type===j.FOUL?r.fouls[M]++:b.type===j.YELLOW_CARD?(r.cards[M].yellow++,b.playerId&&r.playerRatings[b.playerId]&&(r.playerRatings[b.playerId].yellowCards++,r.playerRatings[b.playerId].rating-=.5)):b.type===j.RED_CARD&&(r.cards[M].red++,b.playerId&&r.playerRatings[b.playerId]&&(r.playerRatings[b.playerId].redCards++,r.playerRatings[b.playerId].rating-=2))}m===45&&r.events.push({minute:45,type:"half_time",commentary:Y("half_time",{homeScore:r.homeScore,awayScore:r.awayScore})})}r.events.push({minute:90,type:"full_time",commentary:Y("full_time",{homeScore:r.homeScore,awayScore:r.awayScore})});let f=0,p=null;for(const[m,h]of Object.entries(r.playerRatings))h.rating=Math.max(4,Math.min(10,h.rating)),h.rating>f&&(f=h.rating,p=h.player);return r.manOfTheMatch=p,r}function an(){const e=[];for(let t=1;t<=45;t++)Math.random()<.35&&e.push(t);for(let t=46;t<=90;t++)Math.random()<.35&&e.push(t);for(;e.length<15;){const t=g(1,90);e.includes(t)||e.push(t)}return e.sort((t,n)=>t-n)}function ot(e,t,n){const i=n?e:t,a=n?t:e;return i>a?"win":i<a?"loss":"draw"}function sn(e,t,n){const i=n&&t.homeScore>t.awayScore||!n&&t.awayScore>t.homeScore,a=t.homeScore===t.awayScore;e.forEach(s=>{if(!s)return;const r=t.playerRatings[s.id];if(!r)return;s.goals=(s.goals||0)+r.goals,s.assists=(s.assists||0)+r.assists;let l=0;i?l+=5:a?l+=1:l-=3,r.rating>=8?l+=3:r.rating>=7?l+=1:r.rating<5.5&&(l-=2),s.morale=Math.max(20,Math.min(100,(s.morale||70)+l)),s.fitness=Math.max(50,(s.fitness||90)-g(5,15)),s.energy=Math.max(30,(s.energy||80)-g(10,25))})}const W={matchesPerSeason:14,teamsPerDivision:8,promotionSpots:2,relegationSpots:2,playoffSpots:{from:3,to:6}},on=[{day:1,type:"cash",amount:100,description:"Welkom terug!"},{day:2,type:"cash",amount:200,description:"Dag 2 bonus!"},{day:3,type:"cash",amount:300,description:"Halverwege de week!"},{day:4,type:"cash",amount:400,description:"Doorzetten!"},{day:5,type:"cash",amount:500,description:"Bijna weekend!"},{day:6,type:"cash",amount:600,description:"Nog één dag!"},{day:7,type:"special",amount:1e3,description:"Week voltooid! Bonus!"}],Se=[{level:1,xpRequired:0,title:"Beginnend Trainer"},{level:2,xpRequired:100,title:"Assistent Coach"},{level:3,xpRequired:300,title:"Jeugdtrainer"},{level:4,xpRequired:600,title:"Trainer B"},{level:5,xpRequired:1e3,title:"Trainer A"},{level:6,xpRequired:1500,title:"Hoofdcoach"},{level:7,xpRequired:2200,title:"Ervaren Coach"},{level:8,xpRequired:3e3,title:"Tacticus"},{level:9,xpRequired:4e3,title:"Meestertrainer"},{level:10,xpRequired:5500,title:"Strategisch Genie"},{level:15,xpRequired:1e4,title:"Legendarische Coach"},{level:20,xpRequired:2e4,title:"Voetbalicoon"},{level:25,xpRequired:35e3,title:"Hall of Famer"},{level:30,xpRequired:5e4,title:"De Beste Aller Tijden"}],rn={matchWin:50,matchDraw:20,matchLoss:10,cleanSheet:25,goalScored:5,promotion:500,title:1e3,youthGraduate:75,playerSold:25,stadiumUpgrade:50,achievementUnlocked:100};function rt(e,t,n=null){ee(t);const i=[],a={amateur:["Vv De Meeuwen","SC Concordia","FC Voorwaarts","SV Oranje","VV Eendracht","SC Victoria","FC De Toekomst","SV Sparta","VV Olympia","SC Hercules","FC Amicitia","SV Fortuna","VV De Adelaars","SC Minerva","FC Ons Dorp","SV De Sterren"],semipro:["FC Groningen Amateurs","SC Twente","VV Eindhoven","FC Rotterdam Zuid","SV Amsterdam Noord","VV Den Haag","SC Utrecht City","FC Brabant","SV Gelderland","VV Limburg"],pro:["Jong FC Utrecht","SC Cambuur","FC Emmen","VVV Venlo","Roda JC","NAC Breda","FC Dordrecht","Almere City FC"]};let s;t>=5?s=a.amateur:t>=2?s=a.semipro:s=a.pro;const r=[...s].sort(()=>Math.random()-.5);for(let c=0;c<W.teamsPerDivision-1;c++){const u=r[c]||`FC Team ${c+1}`,d=g(0,W.matchesPerSeason),f=g(0,d),p=g(0,d-f),m=d-f-p,h=f*g(2,4)+p*g(0,2)+m*g(0,1),y=m*g(2,4)+p*g(0,2)+f*g(0,1);i.push({name:u,played:d,won:f,drawn:p,lost:m,goalsFor:h,goalsAgainst:y,goalDiff:h-y,points:f*3+p,isPlayer:!1})}const l={name:e,played:0,won:0,drawn:0,lost:0,goalsFor:0,goalsAgainst:0,goalDiff:0,points:0,isPlayer:!0};return i.push(l),i.sort((c,u)=>u.points!==c.points?u.points-c.points:u.goalDiff!==c.goalDiff?u.goalDiff-c.goalDiff:u.goalsFor-c.goalsFor),i.forEach((c,u)=>{c.position=u+1}),i}function de(e,t,n,i){const a=e.find(s=>s.name===t);return a&&(a.played++,a.goalsFor+=n,a.goalsAgainst+=i,a.goalDiff=a.goalsFor-a.goalsAgainst,n>i?(a.won++,a.points+=3):n===i?(a.drawn++,a.points+=1):a.lost++,e.sort((s,r)=>r.points!==s.points?r.points-s.points:r.goalDiff!==s.goalDiff?r.goalDiff-s.goalDiff:r.goalsFor-s.goalsFor),e.forEach((s,r)=>{s.position=r+1})),e}function ln(e){return e.find(n=>n.isPlayer)&&e.forEach(n=>{if(n.isPlayer||Math.random()>.7)return;const i=e.filter(d=>d.name!==n.name&&!d.isPlayer);if(i.length===0)return;const a=T(i);let r=.4+(a.position-n.position)*.05;r=Math.max(.2,Math.min(.7,r));const l=Math.random();let c,u;l<r?(c=g(1,4),u=g(0,c-1)):l<r+.25?(c=g(0,3),u=c):(u=g(1,4),c=g(0,u-1)),de(e,n.name,c,u),de(e,a.name,u,c)}),e}function cn(e){const t=e.find(n=>n.isPlayer);return t&&t.played>=W.matchesPerSeason}function lt(e,t){const n=e.find(s=>s.isPlayer);if(!n)return null;const i=n.position,a={position:i,points:n.points,goalsFor:n.goalsFor,goalsAgainst:n.goalsAgainst,won:n.won,drawn:n.drawn,lost:n.lost,isChampion:i===1,promoted:!1,relegated:!1,playoffs:!1,newDivision:t};return i<=W.promotionSpots&&t>0?(a.promoted=!0,a.newDivision=t-1):i>W.teamsPerDivision-W.relegationSpots&&t<8?(a.relegated=!0,a.newDivision=t+1):i>=W.playoffSpots.from&&i<=W.playoffSpots.to&&(a.playoffs=!0),a}function dn(e){const t=lt(e.standings,e.club.division);if(t&&(e.club.division=t.newDivision,t.isChampion&&(e.club.stats.titles=(e.club.stats.titles||0)+1),t.newDivision<e.club.stats.highestDivision&&(e.club.stats.highestDivision=t.newDivision)),e.season++,e.week=1,e.standings=rt(e.club.name,e.club.division),e.players.forEach(i=>{i.age++,i.goals=0,i.assists=0}),e.youthPlayers&&e.youthPlayers.forEach(i=>{i.age++}),ee(e.club.division)){const i=t?.promoted?1.5:t?.relegated?.8:1.1;e.club.budget=Math.round(e.club.budget*i)}return e.club.settingsChangedThisSeason=!1,t}function ct(e){const t=Date.now(),n=new Date(t).toDateString();e.dailyRewards||(e.dailyRewards={lastLogin:null,lastClaimDate:null,streak:0});const i=e.dailyRewards.lastClaimDate;if(i===n)return{alreadyClaimed:!0,streak:e.dailyRewards.streak};const a=new Date(t-1440*60*1e3).toDateString();i===a?e.dailyRewards.streak++:e.dailyRewards.streak=1;const s=(e.dailyRewards.streak-1)%7+1,r=on[s-1];return(r.type==="cash"||r.type==="special")&&(e.club.budget+=r.amount),e.dailyRewards.lastClaimDate=n,e.dailyRewards.lastLogin=t,{claimed:!0,streak:e.dailyRewards.streak,streakDay:s,reward:r}}function Ie(e){let t=Se[0];for(const i of Se)if(e>=i.xpRequired)t=i;else break;const n=Se.find(i=>i.xpRequired>e);return{level:t.level,title:t.title,xp:e,xpToNext:n?n.xpRequired-e:0,nextLevel:n?.level||t.level,progress:n?(e-t.xpRequired)/(n.xpRequired-t.xpRequired):1}}function ae(e,t,n=null){e.manager||(e.manager={xp:0,level:1});const i=n||rn[t]||0,a=Ie(e.manager.xp);e.manager.xp+=i;const s=Ie(e.manager.xp);return{xpGained:i,totalXP:e.manager.xp,leveledUp:s.level>a.level,oldLevel:a.level,newLevel:s.level,newTitle:s.title}}function un(e,t){const n=e.map(r=>r.name);e.find(r=>r.isPlayer)?.name;const i=[],a=n.length,s=(a-1)*2;for(let r=0;r<s;r++){const l=[];for(let c=0;c<a/2;c++){const u=(r+c)%(a-1);let d=(a-1-c+r)%(a-1);c===0&&(d=a-1),r>=a-1?l.push({home:n[d],away:n[u]}):l.push({home:n[u],away:n[d]})}i.push(l)}return i}function fn(e,t){const n=un(e),i=e.find(u=>u.isPlayer);if(!i||t>n.length)return null;const s=n[t-1].find(u=>u.home===i.name||u.away===i.name);if(!s)return null;const r=s.home===i.name,l=r?s.away:s.home,c=e.find(u=>u.name===l);return{name:l,position:c?.position||4,isHome:r}}const w={MATCHES:"matches",GOALS:"goals",SEASON:"season",CLUB:"club",PLAYERS:"players",STADIUM:"stadium",SPECIAL:"special"},Ve={firstWin:{id:"firstWin",name:"Eerste Overwinning",description:"Win je eerste wedstrijd",category:w.MATCHES,icon:"🏆",reward:{cash:500},check:e=>e.club.stats.totalMatches>0&&pn(e)},tenWins:{id:"tenWins",name:"Routinier",description:"Win 10 wedstrijden",category:w.MATCHES,icon:"🎖️",reward:{cash:2e3},check:e=>(e.stats?.wins||0)>=10},fiftyWins:{id:"fiftyWins",name:"Winnaar",description:"Win 50 wedstrijden",category:w.MATCHES,icon:"🏅",reward:{cash:1e4},check:e=>(e.stats?.wins||0)>=50},hundredWins:{id:"hundredWins",name:"Meester",description:"Win 100 wedstrijden",category:w.MATCHES,icon:"👑",reward:{cash:25e3},check:e=>(e.stats?.wins||0)>=100},threeWinsInRow:{id:"threeWinsInRow",name:"Op Dreef",description:"Win 3 wedstrijden op rij",category:w.MATCHES,icon:"🔥",reward:{cash:1500},check:e=>(e.stats?.currentWinStreak||0)>=3},fiveWinsInRow:{id:"fiveWinsInRow",name:"Onstuitbaar",description:"Win 5 wedstrijden op rij",category:w.MATCHES,icon:"💪",reward:{cash:4e3},check:e=>(e.stats?.currentWinStreak||0)>=5},unbeatenRun:{id:"unbeatenRun",name:"Ongeslagen",description:"Blijf 5 wedstrijden ongeslagen",category:w.MATCHES,icon:"🛡️",reward:{cash:3e3},check:e=>(e.stats?.currentUnbeaten||0)>=5},cleanSheet:{id:"cleanSheet",name:"De Nul",description:"Houd je doel schoon",category:w.MATCHES,icon:"🧤",reward:{cash:500},check:e=>(e.stats?.cleanSheets||0)>=1},tenCleanSheets:{id:"tenCleanSheets",name:"Verdedigingswall",description:"Houd 10 keer je doel schoon",category:w.MATCHES,icon:"🧱",reward:{cash:5e3},check:e=>(e.stats?.cleanSheets||0)>=10},comeback:{id:"comeback",name:"Comeback King",description:"Win een wedstrijd na achterstand",category:w.MATCHES,icon:"🔄",reward:{cash:2e3},check:e=>(e.stats?.comebacks||0)>=1},firstGoal:{id:"firstGoal",name:"Eerste Doelpunt",description:"Scoor je eerste doelpunt",category:w.GOALS,icon:"⚽",reward:{cash:250},check:e=>(e.club.stats?.totalGoals||0)>=1},fiftyGoals:{id:"fiftyGoals",name:"Doelpuntenfabriek",description:"Scoor 50 doelpunten",category:w.GOALS,icon:"🎯",reward:{cash:5e3},check:e=>(e.club.stats?.totalGoals||0)>=50},hundredGoals:{id:"hundredGoals",name:"Goaltjesdief",description:"Scoor 100 doelpunten",category:w.GOALS,icon:"💯",reward:{cash:15e3},check:e=>(e.club.stats?.totalGoals||0)>=100},fiveGoalsMatch:{id:"fiveGoalsMatch",name:"Kansenregen",description:"Scoor 5+ doelpunten in één wedstrijd",category:w.GOALS,icon:"🌧️",reward:{cash:3e3},check:e=>(e.stats?.highestScoreMatch||0)>=5},hatTrick:{id:"hatTrick",name:"Hattrick Held",description:"Een speler scoort een hattrick",category:w.GOALS,icon:"🎩",reward:{cash:2500},check:e=>(e.stats?.hatTricks||0)>=1},promotion:{id:"promotion",name:"Kampioen!",description:"Promoveer naar een hogere divisie",category:w.SEASON,icon:"⬆️",reward:{cash:1e4},check:e=>(e.stats?.promotions||0)>=1},threePromotions:{id:"threePromotions",name:"Stijgende Ster",description:"Promoveer 3 keer",category:w.SEASON,icon:"🌟",reward:{cash:5e4},check:e=>(e.stats?.promotions||0)>=3},title:{id:"title",name:"Landskampioen",description:"Word kampioen van je divisie",category:w.SEASON,icon:"🏆",reward:{cash:25e3},check:e=>(e.club.stats?.titles||0)>=1},threeTitles:{id:"threeTitles",name:"Dynastie",description:"Win 3 kampioenschappen",category:w.SEASON,icon:"👑",reward:{cash:1e5},check:e=>(e.club.stats?.titles||0)>=3},topFlight:{id:"topFlight",name:"De Top Bereikt",description:"Bereik de Eredivisie",category:w.SEASON,icon:"🏛️",reward:{cash:5e5},check:e=>e.club.division===0},surviveRelegation:{id:"surviveRelegation",name:"Op Het Nippertje",description:"Ontsnap aan degradatie (eindig 6e)",category:w.SEASON,icon:"😅",reward:{cash:1e3},check:e=>(e.stats?.relegationEscapes||0)>=1},millionaire:{id:"millionaire",name:"Miljonair",description:"Heb €1.000.000 op de bank",category:w.CLUB,icon:"💰",reward:{xp:500},check:e=>e.club.budget>=1e6},tenMillion:{id:"tenMillion",name:"Tycoon",description:"Heb €10.000.000 op de bank",category:w.CLUB,icon:"💎",reward:{xp:2e3},check:e=>e.club.budget>=1e7},highReputation:{id:"highReputation",name:"Bekende Club",description:"Bereik 50 reputatie",category:w.CLUB,icon:"⭐",reward:{cash:5e3},check:e=>e.club.reputation>=50},topReputation:{id:"topReputation",name:"Topclub",description:"Bereik 90 reputatie",category:w.CLUB,icon:"🌟",reward:{cash:25e3},check:e=>e.club.reputation>=90},youthGraduate:{id:"youthGraduate",name:"Kweekvijver",description:"Laat een jeugdspeler doorstromen",category:w.PLAYERS,icon:"🌱",reward:{cash:1e3},check:e=>(e.stats?.youthGraduates||0)>=1},tenYouthGraduates:{id:"tenYouthGraduates",name:"Jeugdopleiding",description:"Laat 10 jeugdspelers doorstromen",category:w.PLAYERS,icon:"🏫",reward:{cash:2e4},check:e=>(e.stats?.youthGraduates||0)>=10},topScorer:{id:"topScorer",name:"Topscorer",description:"Heb een speler met 20+ goals in een seizoen",category:w.PLAYERS,icon:"🥇",reward:{cash:5e3},check:e=>e.players.some(t=>(t.goals||0)>=20)},starPlayer:{id:"starPlayer",name:"Sterspeler",description:"Heb een speler met 80+ overall",category:w.PLAYERS,icon:"⭐",reward:{cash:1e4},check:e=>e.players.some(t=>t.overall>=80)},legendPlayer:{id:"legendPlayer",name:"Legende",description:"Heb een speler met 90+ overall",category:w.PLAYERS,icon:"👑",reward:{cash:5e4},check:e=>e.players.some(t=>t.overall>=90)},fullSquad:{id:"fullSquad",name:"Volledige Selectie",description:"Heb 22 spelers in je selectie",category:w.PLAYERS,icon:"👥",reward:{cash:2500},check:e=>e.players.length>=22},goodTransfer:{id:"goodTransfer",name:"Transferkoning",description:"Verkoop een speler voor €100.000+",category:w.PLAYERS,icon:"💸",reward:{cash:5e3},check:e=>(e.stats?.highestSale||0)>=1e5},stadiumFull:{id:"stadiumFull",name:"Uitverkocht",description:"Vul je stadion volledig",category:w.STADIUM,icon:"🏟️",reward:{cash:2e3},check:e=>(e.stats?.sellouts||0)>=1},bigStadium:{id:"bigStadium",name:"Grote Capaciteit",description:"Bereik 5.000 stadioncapaciteit",category:w.STADIUM,icon:"🏗️",reward:{cash:1e4},check:e=>e.stadium.capacity>=5e3},hugeStadium:{id:"hugeStadium",name:"Mega Stadion",description:"Bereik 20.000 stadioncapaciteit",category:w.STADIUM,icon:"🏛️",reward:{cash:5e4},check:e=>e.stadium.capacity>=2e4},fullFacilities:{id:"fullFacilities",name:"Compleet Complex",description:"Upgrade alle faciliteiten naar niveau 3",category:w.STADIUM,icon:"🏢",reward:{cash:25e3},check:e=>mn(e)},derdeHelft:{id:"derdeHelft",name:"Derde Helft",description:"Speel 50 wedstrijden (ervaar de echte clubcultuur)",category:w.SPECIAL,icon:"🍺",reward:{cash:5e3},check:e=>(e.club.stats?.totalMatches||0)>=50},kantinedienst:{id:"kantinedienst",name:"Kantinedienst",description:"Upgrade de kantine naar niveau 3",category:w.SPECIAL,icon:"🍟",reward:{cash:3e3},check:e=>e.stadium.kantine==="kantine_3"},trouweSupporter:{id:"trouweSupporter",name:"Trouwe Supporter",description:"Log 7 dagen achter elkaar in",category:w.SPECIAL,icon:"❤️",reward:{cash:7500},check:e=>(e.dailyRewards?.streak||0)>=7},weekendVoetballer:{id:"weekendVoetballer",name:"Weekendvoetballer",description:"Speel een wedstrijd op zaterdag",category:w.SPECIAL,icon:"📅",reward:{cash:500},check:e=>(e.stats?.saturdayMatches||0)>=1},lokaleHeld:{id:"lokaleHeld",name:"Lokale Held",description:"Win 10 thuiswedstrijden",category:w.SPECIAL,icon:"🏠",reward:{cash:4e3},check:e=>(e.stats?.homeWins||0)>=10},perfectSeason:{id:"perfectSeason",name:"Verborgen",description:"Win alle wedstrijden in een seizoen",category:w.SPECIAL,icon:"❓",hidden:!0,reward:{cash:1e5},check:e=>e.stats?.perfectSeason===!0},scoreTen:{id:"scoreTen",name:"Verborgen",description:"Scoor 10+ doelpunten in één wedstrijd",category:w.SPECIAL,icon:"❓",hidden:!0,reward:{cash:15e3},check:e=>(e.stats?.highestScoreMatch||0)>=10},midnight:{id:"midnight",name:"Verborgen",description:"Speel om middernacht",category:w.SPECIAL,icon:"❓",hidden:!0,reward:{cash:1e3},check:e=>e.stats?.playedAtMidnight===!0},almostRelegation:{id:"almostRelegation",name:"Verborgen",description:"Ontsnap 3x aan degradatie",category:w.SPECIAL,icon:"❓",hidden:!0,reward:{cash:1e4},check:e=>(e.stats?.relegationEscapes||0)>=3},youthStar:{id:"youthStar",name:"Verborgen",description:"Train een jeugdspeler naar 85+ overall",category:w.SPECIAL,icon:"❓",hidden:!0,reward:{cash:25e3},check:e=>e.players.some(t=>t.fromYouth&&t.overall>=85)}};function pn(e){return(e.stats?.wins||0)>=1}function mn(e){return["training","medical","academy","scouting"].every(n=>{const i=e.stadium[n];return i&&i.endsWith("_3")})}function dt(){const e={};for(const t of Object.keys(Ve))e[t]={unlocked:!1,unlockedAt:null};return e}function qe(e){e.achievements||(e.achievements=dt());const t=[];for(const[n,i]of Object.entries(Ve))if(!e.achievements[n]?.unlocked)try{i.check(e)&&(e.achievements[n]={unlocked:!0,unlockedAt:Date.now()},i.reward&&(i.reward.cash&&(e.club.budget+=i.reward.cash),i.reward.xp&&e.manager&&(e.manager.xp=(e.manager.xp||0)+i.reward.xp)),t.push({...i,id:n}))}catch(a){console.error(`Error checking achievement ${n}:`,a)}return t}function ut(e){const t=[];for(const[n,i]of Object.entries(Ve))t.push({...i,id:n,unlocked:e.achievements?.[n]?.unlocked||!1,unlockedAt:e.achievements?.[n]?.unlockedAt||null});return t}function Be(e){const t=ut(e),n=t.filter(a=>a.unlocked),i={};for(const a of Object.values(w)){const s=t.filter(l=>l.category===a),r=s.filter(l=>l.unlocked);i[a]={total:s.length,unlocked:r.length,progress:s.length>0?Math.round(r.length/s.length*100):0}}return{total:t.length,unlocked:n.length,progress:Math.round(n.length/t.length*100),byCategory:i}}const B={PLAYER:"player",STADIUM:"stadium",FINANCIAL:"financial",YOUTH:"youth",DUTCH:"dutch"},L={MINOR:"minor",MODERATE:"moderate",MAJOR:"major"},hn={playerInjuryTraining:{id:"playerInjuryTraining",category:B.PLAYER,severity:L.MODERATE,title:"Blessure op Training",getMessage:e=>`${e.player.name} heeft zich geblesseerd tijdens de training! Hij is ${e.weeks} weken uit de roulatie.`,icon:"🏥",probability:.03,condition:e=>e.players.length>0,choices:[{text:"Laat hem rusten",effect:(e,t)=>{t.player.injured=!0,t.player.injuryWeeks=t.weeks,t.player.fitness=Math.max(30,t.player.fitness-20)}},{text:"Versneld hersteltraject (€500)",effect:(e,t)=>{e.club.budget>=500&&(e.club.budget-=500,t.player.injured=!0,t.player.injuryWeeks=Math.max(1,t.weeks-1))},condition:e=>e.club.budget>=500}],getData:e=>({player:T(e.players),weeks:g(1,4)})},playerFormDrop:{id:"playerFormDrop",category:B.PLAYER,severity:L.MINOR,title:"Vormcrisis",getMessage:e=>`${e.player.name} heeft een moeilijke periode. Zijn moraal is gedaald.`,icon:"📉",probability:.04,condition:e=>e.players.length>0,choices:[{text:"Geef hem een peptalk",effect:(e,t)=>{t.player.morale=Math.max(30,t.player.morale-10)}},{text:"Laat hem even op de bank",effect:(e,t)=>{t.player.morale=Math.max(40,t.player.morale-5)}}],getData:e=>({player:T(e.players.filter(t=>t.morale>50))})},playerDemandRaise:{id:"playerDemandRaise",category:B.PLAYER,severity:L.MODERATE,title:"Salarisverhoging Gevraagd",getMessage:e=>`${e.player.name} wil een salarisverhoging van ${e.raise}% (€${e.newSalary-e.player.salary}/week extra).`,icon:"💰",probability:.02,condition:e=>e.players.some(t=>t.overall>=50),choices:[{text:"Akkoord",effect:(e,t)=>{t.player.salary=t.newSalary,t.player.morale=Math.min(100,t.player.morale+10)}},{text:"Weigeren",effect:(e,t)=>{t.player.morale=Math.max(20,t.player.morale-20)}},{text:"Onderhandelen (50% verhoging)",effect:(e,t)=>{t.player.salary=Math.round(t.player.salary*1.1),t.player.morale=Math.min(100,t.player.morale+3)}}],getData:e=>{const t=T(e.players.filter(i=>i.overall>=50)),n=g(10,30);return{player:t,raise:n,newSalary:Math.round(t.salary*(1+n/100))}}},playerBreakthrough:{id:"playerBreakthrough",category:B.PLAYER,severity:L.MAJOR,title:"Doorbraak!",getMessage:e=>`${e.player.name} heeft een geweldige week gehad! Zijn attributes zijn verbeterd.`,icon:"🌟",probability:.01,condition:e=>e.players.some(t=>t.age<=23&&t.overall<t.potential-5),choices:[{text:"Fantastisch!",effect:(e,t)=>{const n=Object.keys(t.player.attributes);for(let i=0;i<2;i++){const a=T(n);t.player.attributes[a]=Math.min(99,t.player.attributes[a]+g(2,4))}t.player.overall=Math.min(99,t.player.overall+g(1,3)),t.player.morale=Math.min(100,t.player.morale+15)}}],getData:e=>({player:T(e.players.filter(t=>t.age<=23&&t.overall<t.potential-5))})},stadiumVandalism:{id:"stadiumVandalism",category:B.STADIUM,severity:L.MODERATE,title:"Vandalisme",getMessage:e=>`Vandalen hebben schade aangericht aan je stadion. Reparatiekosten: €${e.cost}.`,icon:"🔨",probability:.015,condition:e=>e.stadium.capacity>500,choices:[{text:"Repareren",effect:(e,t)=>{e.club.budget-=t.cost}},{text:"Laten zitten (reputatie -5)",effect:(e,t)=>{e.club.reputation=Math.max(1,e.club.reputation-5)}}],getData:e=>({cost:g(200,1e3)})},stadiumWeatherDamage:{id:"stadiumWeatherDamage",category:B.STADIUM,severity:L.MINOR,title:"Stormschade",getMessage:e=>`Een storm heeft schade aangericht aan het dak van de tribune. Kosten: €${e.cost}.`,icon:"🌧️",probability:.02,condition:e=>!0,choices:[{text:"Direct repareren",effect:(e,t)=>{e.club.budget-=t.cost}}],getData:e=>({cost:g(100,500)})},sponsorOffer:{id:"sponsorOffer",category:B.FINANCIAL,severity:L.MAJOR,title:"Sponsoraanbod",getMessage:e=>`${e.sponsorName} wil je club sponsoren met €${e.amount} per week!`,icon:"🤝",probability:.01,condition:e=>e.club.reputation>=30,choices:[{text:"Accepteren",effect:(e,t)=>{e.club.budget+=t.amount*4,e.extraSponsors||(e.extraSponsors=[]),e.extraSponsors.push({name:t.sponsorName,weeklyIncome:t.amount})}},{text:"Afwijzen",effect:()=>{}}],getData:e=>({sponsorName:T(["Lokale Bakkerij","Autobedrijf Van Dijk","Café Het Dorstige Hert","Bouwbedrijf Constructie","Sportwinkel De Speelman","Kapsalon Knip & Go"]),amount:g(100,500)})},taxAudit:{id:"taxAudit",category:B.FINANCIAL,severity:L.MODERATE,title:"Belastingcontrole",getMessage:e=>`De Belastingdienst heeft een kleine fout gevonden. Je moet €${e.fine} betalen.`,icon:"📋",probability:.01,condition:e=>e.club.budget>1e3,choices:[{text:"Betalen",effect:(e,t)=>{e.club.budget-=t.fine}},{text:"In beroep gaan (50% kans)",effect:(e,t)=>{Math.random()>.5?e.club.budget-=Math.round(t.fine*.3):e.club.budget-=Math.round(t.fine*1.5)}}],getData:e=>({fine:Math.round(e.club.budget*.05)})},donation:{id:"donation",category:B.FINANCIAL,severity:L.MINOR,title:"Donatie",getMessage:e=>`Een anonieme weldoener heeft €${e.amount} gedoneerd aan de club!`,icon:"🎁",probability:.02,condition:e=>!0,choices:[{text:"Geweldig!",effect:(e,t)=>{e.club.budget+=t.amount}}],getData:e=>({amount:g(500,2e3)})},wonderkindSpotted:{id:"wonderkindSpotted",category:B.YOUTH,severity:L.MAJOR,title:"Wonderkind Gespot!",getMessage:e=>`Je scout heeft een bijzonder talent ontdekt: ${e.playerName}, ${e.age} jaar. Wil je hem naar de jeugd halen?`,icon:"🌟",probability:.008,condition:e=>e.scoutingNetwork!=="none",choices:[{text:"Aannemen",effect:(e,t)=>{e.youthPlayers||(e.youthPlayers=[]),e.youthPlayers.push(t.player)}},{text:"Niet interessant",effect:()=>{}}],getData:e=>{const t=g(14,17),n=g(60,85);return{playerName:`${T(["Jayden","Dani","Nouri","Mo","Justin"])} ${T(["de Jong","Bakker","El Ghazi"])}`,age:t,player:{id:Date.now()+Math.random(),name:"Jayden de Jong",age:t,position:T(["centraleMid","spits","linksbuiten"]),overall:g(25,40),potential:n,attributes:{AAN:g(20,40),VER:g(20,40),SNE:g(20,40),FYS:g(20,40)}}}}},youthBreakthrough:{id:"youthBreakthrough",category:B.YOUTH,severity:L.MODERATE,title:"Jeugdspeler Klopt Aan",getMessage:e=>`Jeugdspeler ${e.player.name} wil graag doorstromen naar het eerste elftal!`,icon:"🎓",probability:.03,condition:e=>e.youthPlayers&&e.youthPlayers.length>0,choices:[{text:"Laat hem doorstromen",effect:(e,t)=>{e.players.push(t.player),e.youthPlayers=e.youthPlayers.filter(n=>n.id!==t.player.id),e.stats||(e.stats={}),e.stats.youthGraduates=(e.stats.youthGraduates||0)+1}},{text:"Nog een seizoen wachten",effect:(e,t)=>{t.player.morale=Math.max(30,(t.player.morale||70)-15)}}],getData:e=>({player:T(e.youthPlayers.filter(t=>t.age>=17))})},kantinedienst:{id:"kantinedienst",category:B.DUTCH,severity:L.MINOR,title:"Kantinedienst",getMessage:e=>`Het is ${e.player.name} zijn beurt voor kantinedienst dit weekend. Frikandellen bakken!`,icon:"🍟",probability:.05,condition:e=>e.players.length>0,choices:[{text:"Prima, hoort erbij!",effect:(e,t)=>{t.player.morale=Math.min(100,t.player.morale+3),e.club.budget+=50}},{text:"Laat iemand anders het doen (€50)",effect:(e,t)=>{e.club.budget-=50}}],getData:e=>({player:T(e.players)})},scheidsrechterControverse:{id:"scheidsrechterControverse",category:B.DUTCH,severity:L.MINOR,title:"Scheidsrechter Controversie",getMessage:e=>"De scheidsrechter van vorige week heeft een discutabele beslissing genomen. De spelers zijn ontevreden.",icon:"🟨",probability:.04,condition:e=>e.club.stats?.totalMatches>0,choices:[{text:"Klacht indienen",effect:(e,t)=>{Math.random()>.5?e.club.reputation=Math.min(100,e.club.reputation+2):e.club.reputation=Math.max(1,e.club.reputation-1)}},{text:"Laten rusten",effect:(e,t)=>{e.players.forEach(n=>{n.morale=Math.max(30,n.morale-2)})}}],getData:e=>({})},derdeHelftIncident:{id:"derdeHelftIncident",category:B.DUTCH,severity:L.MINOR,title:"Derde Helft Incident",getMessage:e=>`Tijdens de derde helft in de kantine ging het er gezellig aan toe. ${e.player.name} heeft iets te veel gedronken...`,icon:"🍺",probability:.03,condition:e=>e.players.length>0,choices:[{text:"Lachen, het hoort erbij",effect:(e,t)=>{t.player.fitness=Math.max(50,t.player.fitness-10),t.player.morale=Math.min(100,t.player.morale+5)}},{text:"Streng toespreken",effect:(e,t)=>{t.player.morale=Math.max(30,t.player.morale-5)}}],getData:e=>({player:T(e.players)})},kunstgrasDebat:{id:"kunstgrasDebat",category:B.DUTCH,severity:L.MINOR,title:"Kunstgras Debat",getMessage:e=>"De gemeente overweegt om kunstgras aan te leggen. De oudere spelers zijn tegen, de jongeren zijn voor.",icon:"🏟️",probability:.01,condition:e=>e.stadium.grass!=="grass_3",choices:[{text:"Steun kunstgras",effect:(e,t)=>{e.players.filter(n=>n.age<25).forEach(n=>{n.morale=Math.min(100,n.morale+3)}),e.players.filter(n=>n.age>=25).forEach(n=>{n.morale=Math.max(30,n.morale-2)})}},{text:"Blijf bij natuurgras",effect:(e,t)=>{e.players.filter(n=>n.age>=25).forEach(n=>{n.morale=Math.min(100,n.morale+2)})}}],getData:e=>({})},toernooiUitnodiging:{id:"toernooiUitnodiging",category:B.DUTCH,severity:L.MINOR,title:"Toernooi Uitnodiging",getMessage:e=>`Je bent uitgenodigd voor het ${e.tournamentName}! Deelname kost €${e.cost} maar kan €${e.prize} opleveren.`,icon:"🏆",probability:.02,condition:e=>!0,choices:[{text:"Deelnemen",effect:(e,t)=>{e.club.budget-=t.cost,Math.random()<.3?(e.club.budget+=t.prize,e.club.reputation=Math.min(100,e.club.reputation+3)):Math.random()<.5&&(e.club.budget+=Math.round(t.prize*.3)),e.players.forEach(n=>{n.morale=Math.min(100,n.morale+2)})}},{text:"Afzeggen",effect:()=>{}}],getData:e=>({tournamentName:T(["Dorpstoernooi","Paastoernooi","Zomertoernooi","Nieuwjaarstoernooi","Kroegentocht Cup","Lokale Derby Days"]),cost:g(100,300),prize:g(500,2e3)})},lokaleSlagerSponsor:{id:"lokaleSlagerSponsor",category:B.DUTCH,severity:L.MINOR,title:"Lokale Slager Sponsort",getMessage:e=>`Slagerij "${e.slagerName}" wil 100 frikandellen leveren voor de kantine en vraagt reclamebord-ruimte.`,icon:"🥩",probability:.02,condition:e=>!0,choices:[{text:"Deal! Frikandellen zijn altijd welkom",effect:(e,t)=>{e.club.budget+=75,e.club.reputation=Math.min(100,e.club.reputation+1)}},{text:"We willen geen reclame",effect:()=>{}}],getData:e=>({slagerName:T(["De Vette Knol","Het Gouden Varken","Slagerij Van Dam","De Lokale Slager"])})},veldbezettingConflict:{id:"veldbezettingConflict",category:B.DUTCH,severity:L.MINOR,title:"Veldbezetting Conflict",getMessage:e=>"De jeugd van een andere club claimt dat zij het veld gereserveerd hadden voor training.",icon:"⚽",probability:.03,condition:e=>!0,choices:[{text:"Veld delen",effect:(e,t)=>{e.club.reputation=Math.min(100,e.club.reputation+2)}},{text:"Wij hebben voorrang",effect:(e,t)=>{e.club.reputation=Math.max(1,e.club.reputation-1)}}],getData:e=>({})},rijdendeTapWagen:{id:"rijdendeTapWagen",category:B.DUTCH,severity:L.MINOR,title:"Rijdende Tap Kapot",getMessage:e=>`De rijdende tap is kapot gegaan! Reparatie kost €${e.cost}. Zonder tap geen bier bij uitwedstrijden...`,icon:"🚐",probability:.02,condition:e=>e.club.budget>200,choices:[{text:"Direct repareren",effect:(e,t)=>{e.club.budget-=t.cost,e.players.forEach(n=>{n.morale=Math.min(100,n.morale+2)})}},{text:"Even wachten",effect:(e,t)=>{e.players.forEach(n=>{n.morale=Math.max(30,n.morale-3)})}}],getData:e=>({cost:g(150,400)})}};function gn(e){const t=Object.values(hn).filter(a=>a.condition(e)?Math.random()<a.probability:!1);if(t.length===0)return null;const n=T(t),i=n.getData(e);return!i||i.player===void 0&&n.getData.toString().includes("player")?null:{...n,data:i,message:n.getMessage(i)}}function yn(e,t,n){const i=t.choices[n];if(i)return i.condition&&!i.condition(e)?{success:!1,reason:"Voorwaarden niet voldaan"}:(i.effect(e,t.data),{success:!0})}function vn(e,t=1){const n=[];for(let i=0;i<t*3&&!(n.length>=t);i++){const a=gn(e);a&&!n.find(s=>s.id===a.id)&&n.push(a)}return n}function bn(){return{events:[],lastEventTime:null}}function xn(e,t,n){e.eventHistory||(e.eventHistory=bn()),e.eventHistory.events.push({id:t.id,title:t.title,message:t.message,choiceIndex:n,timestamp:Date.now(),season:e.season,week:e.week}),e.eventHistory.lastEventTime=Date.now(),e.eventHistory.events.length>50&&(e.eventHistory.events=e.eventHistory.events.slice(-50))}function ft(e){if(!e.eventHistory?.lastEventTime)return!0;const t=3600*1e3;return Date.now()-e.eventHistory.lastEventTime>=t}function E(e,t="info"){const n=document.querySelector(".game-notification");n&&n.remove();const i=document.createElement("div");i.className=`game-notification notification-${t}`,i.innerHTML=`
        <span class="notification-icon">${wn(t)}</span>
        <span class="notification-message">${e}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `,document.body.appendChild(i),setTimeout(()=>{i.parentElement&&(i.classList.add("notification-fade-out"),setTimeout(()=>i.remove(),300))},4e3)}function wn(e){switch(e){case"success":return"✓";case"error":return"✕";case"warning":return"⚠";case"achievement":return"🏆";default:return"ℹ"}}window.showNotification=E;function kn(){return`${T($e)} ${T(Te)}`}function Sn(){const e=[40,8,8,5,5,5,4,4,3,3,3,2,2,2,2,2,2,2,1,3,3,1,1,2],t=e.reduce((i,a)=>i+a,0);let n=Math.random()*t;for(let i=0;i<Q.length;i++)if(n-=e[i],n<=0)return Q[i];return Q[0]}function En(e,t){const n=ee(e),i={};(t==="keeper"?["REF","BAL","SNE","FYS"]:["AAN","VER","SNE","FYS"]).forEach(c=>{i[c]=g(n.minAttr,n.maxAttr)});const r=S[t],l=Object.entries(r.weights).sort((c,u)=>u[1]-c[1])[0][0];return i[l]=Math.min(99,i[l]+g(5,15)),i}function pt(e,t){const n=S[t].weights;let i=0;for(const[a,s]of Object.entries(n))i+=e[a]*s;return Math.round(i)}function Mn(e,t){const n=it[t];if(!n)return{name:"Speler",bonus:{}};let i="AAN",a=0;for(const[s,r]of Object.entries(e))r>a&&(a=r,i=s);return n[i]||{name:"Speler",bonus:{}}}function $n(e,t){const n=8-e,i=t>.8?"top":t>.2?"middle":"bottom";let a,s;n<=2?i==="top"?(a=.2,s=.6):i==="middle"?(a=.5,s=.3):(a=.7,s=.1):(a=.5,s=.3);const r=Math.random();return r<a?T(U.good):r<a+s?T(U.bad):T(U.neutral)}function D(e,t=null,n=17,i=35){if(!t){const p=["keeper","linksback","centraleVerdediger","rechtsback","centraleMid","linksbuiten","rechtsbuiten","spits"],m=[.08,.1,.16,.1,.22,.1,.1,.14],h=Math.random();let y=0;for(let x=0;x<p.length;x++)if(y+=m[x],h<y){t=p[x];break}}const a=En(e,t),s=pt(a,t),r=ee(e),l=(s-r.minAttr)/(r.maxAttr-r.minAttr),c=Sn(),u=Mn(a,t),d=kn(),f=g(n,i);return{id:Date.now()+Math.random(),name:d,age:f,position:t,nationality:c,attributes:a,overall:s,tag:u.name,tagBonus:u.bonus,personality:$n(e,l),salary:Math.round(r.salary.min+(r.salary.max-r.salary.min)*(s/100)),goals:g(0,5),assists:g(0,3),morale:g(60,90),fitness:g(80,100),condition:g(70,100),energy:g(60,100),potential:Ft(s,f),photo:he()}}function he(e,t){const n=["#f5d0c5","#e8beac","#d4a574","#c68642","#8d5524","#6b4423"],i=["#1a1a1a","#3d2314","#6b4423","#8b7355","#d4a76a","#c4c4c4"],a=["short","medium","bald","curly","long"];return{skinTone:T(n),hairColor:T(i),hairStyle:T(a),seed:Math.floor(Math.random()*1e3)}}function Tn(e){const t=[];for(let n=0;n<2;n++)t.push(D(e,"keeper"));t.push(D(e,"linksback")),t.push(D(e,"centraleVerdediger")),t.push(D(e,"centraleVerdediger")),t.push(D(e,"rechtsback")),t.push(D(e,"centraleVerdediger"));for(let n=0;n<5;n++)t.push(D(e,"centraleMid"));return t.push(D(e,"linksbuiten")),t.push(D(e,"linksbuiten")),t.push(D(e,"rechtsbuiten")),t.push(D(e,"rechtsbuiten")),t.push(D(e,"spits")),t.push(D(e,"spits")),t}function An(e,t){if(!e)return 0;let n=0;if(e.position===t)n+=100;else{const i=_(e.position),a=_(t);i===a?n+=75:{linksback:["linksbuiten","centraleMid"],rechtsback:["rechtsbuiten","centraleMid"],centraleVerdediger:["centraleMid"],centraleMid:["linksbuiten","rechtsbuiten","centraleVerdediger","linksback","rechtsback"],linksbuiten:["linksback","centraleMid","spits"],rechtsbuiten:["rechtsback","centraleMid","spits"],spits:["linksbuiten","rechtsbuiten","centraleMid"]}[t]?.includes(e.position)?n+=50:t!=="keeper"&&e.position!=="keeper"&&(n+=25)}return n}function mt(e,t){const n=[],i=H[t].positions;for(let a=0;a<11;a++){const s=e[a];if(!s)continue;const r=i[a];let l=0;for(let c=0;c<11;c++){if(a===c||!e[c])continue;const u=i[c];Math.sqrt(Math.pow(r.x-u.x,2)+Math.pow(r.y-u.y,2))<30&&e[c].nationality.code===s.nationality.code&&(l+=1)}n.push({playerId:s.id,nationalityBonus:l,positionFit:An(s,r.role)})}return n}function Cn(){const e=H[o.formation];let t=0,n=0;const i=mt(o.lineup,o.formation);for(let a=0;a<11;a++){const s=o.lineup[a];if(!s)continue;n++;const r=i.find(c=>c.playerId===s.id);let l=r?.positionFit||0;l+=(r?.nationalityBonus||0)*5,e.idealTags?.includes(s.tag)&&(l+=10),t+=l}return n>0?Math.round(t/n):0}function _e(e){const t=[50,75,100,150,200,300];return t[Math.min(e,t.length-1)]}function q(e,t){const i=Math.pow(.65,t-1),a=Math.round(25*i),s=Math.floor((Math.random()-.5)*a*.3);return{min:Math.max(1,e-a+s),max:Math.min(99,e+a+s),range:a}}function In(e,t,n,i=8){const a=[],s=o.club.division,r=o.stadium.scouting;z.scouting.find(u=>u.id===r);const c=Math.max(0,s+(r==="scout_5"||r==="scout_6"?-1:0));for(let u=0;u<i;u++){const f=D(c,e==="all"?null:e,t,n);f.price=ge(f,c),f.scoutCount=1,f.totalScoutCost=_e(0),f.scoutRanges={overall:q(f.overall,f.scoutCount),potential:q(f.potential,f.scoutCount),attack:q(f.attack,f.scoutCount),defense:q(f.defense,f.scoutCount),speed:q(f.speed,f.scoutCount),stamina:q(f.stamina,f.scoutCount)},f.scoutInfo={overall:!0,attributes:["scout_3","scout_4","scout_5","scout_6"].includes(r),personality:["scout_4","scout_5","scout_6"].includes(r),potential:["scout_5","scout_6"].includes(r)},a.push(f)}return a.sort((u,d)=>d.overall-u.overall)}function Bn(e){const t=o.scoutSearch.results.find(i=>i.id===e);if(!t)return{success:!1,message:"Speler niet gevonden"};const n=_e(t.scoutCount);return o.club.budget<n?{success:!1,message:`Niet genoeg budget! Je hebt ${v(n)} nodig.`}:(o.club.budget-=n,t.scoutCount++,t.totalScoutCost+=n,t.scoutRanges={overall:q(t.overall,t.scoutCount),potential:q(t.potential,t.scoutCount),attack:q(t.attack,t.scoutCount),defense:q(t.defense,t.scoutCount),speed:q(t.speed,t.scoutCount),stamina:q(t.stamina,t.scoutCount)},R(),te(),{success:!0,message:`Scout rapport bijgewerkt! (${t.scoutCount}x gescout)`})}function Ln(e){o.scoutSearch.results.find(n=>n.id===e)&&(o.scoutSearch.dismissed||(o.scoutSearch.dismissed=[]),o.scoutSearch.dismissed.push(e),o.scoutSearch.results=o.scoutSearch.results.filter(n=>n.id!==e),te())}function ge(e,t,n=!0){const i=t||o.club?.division||6,a={8:.1,7:.2,6:.4,5:.8,4:1.5,3:3,2:8,1:25,0:75},s=e.overall||50,r=e.potential||s,l=e.age||25;let c=Math.pow(s,2)*(a[i]||.4)*100;const u=1+(r-s)/100;return c*=u,l<19?c*=1.8:l<22?c*=1.5:l<26?c*=1.2:l<29?c*=1:l<32?c*=.6:l<35?c*=.3:c*=.1,n&&Math.random()<.15?0:Math.round(c)}function Dn(e){return ge(e,o.club?.division,!1)}function Oe(){const e=document.getElementById("standings-body");if(!e)return;const t=o.standings.length,n=2,i=t-2;let a="";o.standings.forEach((s,r)=>{const l=s.isPlayer,c=r+1;let u="";c<=n?u="promotion-zone":c>i&&(u="relegation-zone"),a+=`
            <tr class="${l?"is-player":""} ${u}">
                <td>${c}</td>
                <td>${s.name}</td>
                <td>${s.wins||0}</td>
                <td>${s.draws||0}</td>
                <td>${s.losses||0}</td>
                <td><strong>${s.points}</strong></td>
            </tr>
        `}),e.innerHTML=a}function Fe(){const e=document.getElementById("top-scorers");if(!e)return;const t=[...o.players].sort((i,a)=>a.goals-i.goals).slice(0,3);let n="";t.forEach((i,a)=>{n+=`
            <div class="performer-item">
                <span class="performer-rank ${a===0?"gold":a===1?"silver":"bronze"}">${a+1}</span>
                <div class="performer-info">
                    <span class="performer-name">${i.name}</span>
                    <span class="performer-position">${S[i.position].name}</span>
                </div>
                <span class="performer-goals">${i.goals}</span>
            </div>
        `}),e.innerHTML=n}function J(){const e=document.getElementById("player-cards");if(!e)return;const t={attacker:{name:"Aanvallers",icon:"⚽",players:[]},midfielder:{name:"Middenvelders",icon:"⚙️",players:[]},defender:{name:"Verdedigers",icon:"🛡️",players:[]},goalkeeper:{name:"Keepers",icon:"🧤",players:[]}};o.players.forEach(s=>{const r=_(s.position);t[r]&&t[r].players.push(s)}),Object.values(t).forEach(s=>{s.players.sort((r,l)=>l.overall-r.overall)});let n="";for(const[s,r]of Object.entries(t))r.players.length>0&&(n+=`<div class="squad-group">
                <div class="squad-group-header">
                    <span class="squad-group-icon">${r.icon}</span>
                    <span class="squad-group-name">${r.name}</span>
                    <span class="squad-group-count">${r.players.length}</span>
                </div>
                <div class="squad-group-players">
                    ${r.players.map(l=>Pn(l)).join("")}
                </div>
            </div>`);e.innerHTML=n;const i=document.getElementById("squad-count"),a=document.getElementById("squad-avg");if(i&&(i.textContent=o.players.length),a){const s=Math.round(o.players.reduce((r,l)=>r+l.overall,0)/o.players.length);a.textContent=s}document.querySelectorAll("#player-cards .player-card").forEach(s=>{s.addEventListener("click",()=>{const r=parseFloat(s.dataset.playerId);Si(r)})})}function ht(e,t){if(t>=29)return e.toString();if(t>=26){const n=Math.max(e-2,e),i=Math.min(99,e+2);return`${n}-${i}`}else if(t>=23){const n=Math.max(e-4,e-2),i=Math.min(99,e+4);return`${n}-${i}`}else if(t>=20){const n=Math.max(1,e-6),i=Math.min(99,e+6);return`${n}-${i}`}else{const n=Math.max(1,e-10),i=Math.min(99,e+10);return`${n}-${i}`}}function ue(e){return e<=25?"#f44336":e<=50?"#ff9800":e<=75?"#4caf50":"#2e7d32"}function Pn(e,t=!1){const n=S[e.position]||{abbr:"??",color:"#666"};e.photo||he(e.name,e.position);const i=e.position==="keeper";if(t)return`
            <div class="player-mini-card" data-player-id="${e.id}">
                <span class="mini-overall">${e.overall}</span>
                <span class="mini-flag">${e.nationality.flag}</span>
                <span class="mini-name">${e.name.split(" ")[0]}</span>
                <span class="mini-pos">${n.abbr}</span>
            </div>
        `;i?(e.attributes.REF||e.attributes.VER,e.attributes.BAL||e.attributes.AAN,e.attributes.SNE,e.attributes.FYS):(e.attributes.AAN,e.attributes.VER,e.attributes.SNE,e.attributes.FYS);const a=Dn(e),s=e.condition||85,r=e.energy||75,l=ht(e.potential,e.age);return`
        <div class="player-card" data-player-id="${e.id}">
            <div class="pc-left">
                <div class="pc-age-box">
                    <span class="pc-age-value">${e.age}</span>
                    <span class="pc-age-label">jr</span>
                </div>
                <span class="pc-flag-large">${e.nationality.flag}</span>
            </div>
            <div class="pc-info">
                <div class="pc-name-row">
                    <span class="pc-name">${e.name}</span>
                    <span class="pc-pos" style="background: ${n.color}">${n.abbr}</span>
                    <span class="pc-finance">
                        <span class="pc-salary">${v(e.salary||50)}/w</span>
                        <span class="pc-value">${v(a)}</span>
                    </span>
                </div>
            </div>
            <div class="pc-condition-bars">
                <div class="pc-bar-item">
                    <div class="pc-bar-track">
                        <div class="pc-bar-fill" style="width: ${s}%; background: ${ue(s)}"></div>
                    </div>
                    <span class="pc-bar-label">Conditie</span>
                </div>
                <div class="pc-bar-item">
                    <div class="pc-bar-track">
                        <div class="pc-bar-fill" style="width: ${r}%; background: ${ue(r)}"></div>
                    </div>
                    <span class="pc-bar-label">Energie</span>
                </div>
            </div>
            <div class="pc-ratings">
                <div class="pc-overall" style="background: ${n.color}">
                    <span class="pc-overall-value">${e.overall}</span>
                    <span class="pc-overall-label">ALG</span>
                </div>
                <div class="pc-potential" style="background: ${n.color}; opacity: 0.85;">
                    <span class="pc-potential-value">${l}</span>
                    <span class="pc-potential-label">POT</span>
                </div>
            </div>
        </div>
    `}function Rn(){Nn(),se(),oe(),re(),Hn(),Ka()}function Nn(){const e=document.getElementById("formation-select");if(!e)return;const t=Object.entries(H).sort((i,a)=>{const s=i[0].split("-").map(Number),r=a[0].split("-").map(Number);return r[0]!==s[0]?r[0]-s[0]:0});let n="";for(const[i,a]of t){const s=o.formation===i?"selected":"";n+=`<option value="${i}" ${s}>${i}</option>`}e.innerHTML=n,e.onchange=i=>{const a=o.formation,s=i.target.value,r=[...o.lineup],l=H[a]?.positions||[],c=H[s]?.positions||[],u=new Array(11).fill(null),d=new Set;c.forEach((f,p)=>{for(let m=0;m<11;m++){const h=r[m];if(!h||d.has(h.id))continue;if(l[m]?.role===f.role){u[p]=h,d.add(h.id);break}}}),c.forEach((f,p)=>{if(!u[p])for(let m=0;m<11;m++){const h=r[m];if(!h||d.has(h.id))continue;const y=jn(h.position),x=Vn(f.role);if(y===x){u[p]=h,d.add(h.id);break}}}),o.formation=s,o.lineup=u,se(),oe(),re()}}function jn(e){return e==="keeper"?"keeper":["centraleVerdediger","linksback","rechtsback"].includes(e)?"defense":["centraleMid","aanvallendeMid","verdedigendeMid","linksbuiten","rechtsbuiten"].includes(e)?"midfield":["spits","schaduwspits"].includes(e)?"attack":"midfield"}function Vn(e){return e==="keeper"?"keeper":["centraleVerdediger","linksback","rechtsback"].includes(e)?"defense":["centraleMid","aanvallendeMid","verdedigendeMid","linksbuiten","rechtsbuiten"].includes(e)?"midfield":["spits","schaduwspits"].includes(e)?"attack":"midfield"}function qn(){const e=H[o.formation];if(!e)return{};const t={},n=30;return e.positions.forEach((i,a)=>{const s=o.lineup[a];if(!s)return;const r=[];e.positions.forEach((l,c)=>{if(a===c)return;const u=o.lineup[c];if(!u)return;const d=i.x-l.x,f=i.y-l.y;Math.sqrt(d*d+f*f)<=n&&r.push(u)}),r.length>0&&r.every(c=>c.nationality===s.nationality)&&(t[s.id]=1)}),t}function se(){const e=document.getElementById("lineup-pitch");if(!e)return;const t=H[o.formation];if(!t)return;const n=qn();let i=`
        <div class="pitch-field">
            <div class="pitch-lines">
                <div class="center-circle"></div>
                <div class="center-line"></div>
                <div class="penalty-area-top"></div>
                <div class="penalty-area-bottom"></div>
            </div>
    `;t.positions.forEach((a,s)=>{const r=o.lineup[s],l=S[a.role],c=l?.color||"#666";let u="",d=0,f=!1;if(r){u=Q.find(k=>k.code===r.nationality)?.flag||"🏳️",d=n[r.id]||0;const y=_(r.position),x=_(a.role);f=y!==x}const p=100-a.y,m=a.x;i+=`
            <div class="lineup-slot ${r?"filled":"empty"}"
                 style="left: ${p}%; top: ${m}%;"
                 data-slot-index="${s}"
                 data-role="${a.role}">
                ${r?`
                    <div class="lineup-player ${d>0?"has-chemistry":""} ${f?"wrong-position":""}"
                         draggable="true"
                         data-player-id="${r.id}"
                         style="background: ${c}">
                        <span class="lp-flag">${u}</span>
                        <span class="lp-overall">${r.overall+d}${d>0?'<span class="chemistry-boost">+'+d+"</span>":""}</span>
                        <span class="lp-name">${r.name.split(" ")[0]}</span>
                        <span class="lp-position">${S[r.position]?.abbr||r.position}</span>
                    </div>
                `:`
                    <div class="lineup-empty-slot" style="border-color: ${c}">
                        <span class="slot-pos">${l?.abbr||a.role}</span>
                    </div>
                `}
            </div>
        `}),i+="</div>",e.innerHTML=i,_n()}function oe(){const e=document.getElementById("lineup-available-players");if(!e)return;const t=o.lineup.filter(s=>s).map(s=>s.id),n=o.players.filter(s=>!t.includes(s.id)),i={attacker:{name:"Aanvallers",icon:"⚽",players:[]},midfielder:{name:"Middenvelders",icon:"⚙️",players:[]},defender:{name:"Verdedigers",icon:"🛡️",players:[]},goalkeeper:{name:"Keepers",icon:"🧤",players:[]}};n.forEach(s=>{const r=_(s.position);i[r]&&i[r].players.push(s)}),Object.values(i).forEach(s=>s.players.sort((r,l)=>l.overall-r.overall));let a="";for(const[s,r]of Object.entries(i))r.players.length!==0&&(a+=`
            <div class="player-group">
                <div class="player-group-header">${r.icon} ${r.name}</div>
                <div class="player-group-list">
        `,r.players.forEach(l=>{const c=S[l.position];a+=`
                <div class="available-player"
                     draggable="true"
                     data-player-id="${l.id}">
                    <span class="ap-overall" style="background: ${c?.color||"#666"}">${l.overall}</span>
                    <span class="ap-name">${l.name}</span>
                    <span class="ap-age">${l.age}j</span>
                    <span class="ap-pos">${c?.abbr||"??"}</span>
                </div>
            `}),a+="</div></div>");e.innerHTML=a,document.querySelectorAll(".available-player").forEach(s=>{s.addEventListener("dragstart",On),s.addEventListener("dragend",()=>{s.classList.remove("dragging")})})}function re(){const e=document.getElementById("lineup-fit-fill"),t=document.getElementById("lineup-fit-score"),n=o.lineup.filter(a=>a).length,i=Math.round(n/11*100);e&&(e.style.width=`${i}%`),t&&(t.textContent=`${i}%`)}let V={player:null,fromSlot:null};function _n(){document.querySelectorAll(".lineup-slot").forEach(t=>{t.addEventListener("dragover",n=>{n.preventDefault(),t.classList.add("drag-over")}),t.addEventListener("dragleave",()=>{t.classList.remove("drag-over")}),t.addEventListener("drop",n=>{n.preventDefault(),t.classList.remove("drag-over");const i=parseInt(t.dataset.slotIndex);Fn(i)})}),document.querySelectorAll(".lineup-player").forEach(t=>{t.addEventListener("dragstart",n=>{const i=parseFloat(t.dataset.playerId),a=parseInt(t.closest(".lineup-slot").dataset.slotIndex);V={player:o.players.find(s=>s.id===i),fromSlot:a},t.classList.add("dragging")}),t.addEventListener("dragend",()=>{t.classList.remove("dragging")})});const e=document.getElementById("lineup-available-players");e&&(e.addEventListener("dragover",t=>{t.preventDefault(),e.classList.add("drop-remove-zone")}),e.addEventListener("dragleave",t=>{e.contains(t.relatedTarget)||e.classList.remove("drop-remove-zone")}),e.addEventListener("drop",t=>{t.preventDefault(),e.classList.remove("drop-remove-zone"),V&&V.fromSlot!==void 0&&(o.lineup[V.fromSlot]=null,V=null,se(),oe(),re())}))}function On(e){const t=parseFloat(e.target.dataset.playerId);V={player:o.players.find(i=>i.id===t),fromSlot:null},e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",t.toString()),e.target.classList.add("dragging")}function Fn(e){if(!V.player)return;const t=o.lineup[e];o.lineup[e]=V.player,V.fromSlot!==null&&t?o.lineup[V.fromSlot]=t:V.fromSlot!==null&&(o.lineup[V.fromSlot]=null),V={player:null,fromSlot:null},se(),oe(),re()}function Hn(){document.querySelectorAll(".playstyle-btn").forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(".playstyle-btn").forEach(i=>i.classList.remove("active")),n.classList.add("active"),o.tactics.playstyle=n.dataset.style})}),document.querySelectorAll(".tactic-choice").forEach(n=>{n.addEventListener("click",()=>{n.parentElement.querySelectorAll(".tactic-choice").forEach(i=>i.classList.remove("active")),n.classList.add("active")})});const e=document.getElementById("tactic-width"),t=document.getElementById("width-info");e&&t&&e.addEventListener("input",()=>{const n=parseInt(e.value);n<30?t.textContent="Smal: Compacte verdediging, minder ruimte":n<70?t.textContent="Normaal: Standaard veldbreedte":t.textContent="Breed: Meer ruimte op vleugels, risicovol"})}function ye(){const e=document.getElementById("formation-positions");if(!e)return;const t=H[o.formation],n=mt(o.lineup,o.formation),i=[];for(let s=0;s<11;s++){const r=o.lineup[s];if(r)for(let l=s+1;l<11;l++){const c=o.lineup[l];if(c&&r.nationality.code===c.nationality.code){const u=t.positions[s],d=t.positions[l];Math.sqrt(Math.pow(u.x-d.x,2)+Math.pow(u.y-d.y,2))<30&&i.push({x1:u.x,y1:u.y,x2:d.x,y2:d.y,flag:r.nationality.flag})}}}let a=`
        <svg class="nationality-lines-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#4ade80;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#22c55e;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#4ade80;stop-opacity:1" />
                </linearGradient>
            </defs>
    `;i.forEach(s=>{a+=`
            <line class="nationality-line"
                  x1="${s.x1}" y1="${s.y1}"
                  x2="${s.x2}" y2="${s.y2}"
                  stroke="url(#lineGradient)"
                  stroke-width="0.8"
                  stroke-linecap="round"
                  stroke-dasharray="2,1" />
        `}),a+="</svg>",t.positions.forEach((s,r)=>{const l=o.lineup[r],c=l?n.find(m=>m.playerId===l.id):null;let u="",d="";if(l){const m=c?.positionFit||0,h=c?.nationalityBonus||0;m<50&&(u="penalty",d='<span class="position-penalty">-1</span>'),h>0&&(u+=" has-nationality-bonus",d+=`<span class="position-bonus">+${h}</span>`)}const f=l?"filled":"",p=S[s.role].color;a+=`
            <div class="position-slot ${f} ${u}"
                 style="left: ${s.x}%; top: ${s.y}%;"
                 data-index="${r}"
                 data-role="${s.role}"
                 ondragover="handleDragOver(event)"
                 ondrop="handleDrop(event, ${r})">
                <div class="bonus-indicators">${d}</div>
                <div class="position-marker ${l?"has-player":""}"
                     style="background: ${l?p:"rgba(255,255,255,0.3)"}"
                     draggable="${l?"true":"false"}"
                     ondragstart="handleDragStart(event, ${r}, false)">
                    ${l?`
                        <span class="player-overall-badge">${l.overall}</span>
                        <span class="player-name-field">${l.name.split(" ")[0]}</span>
                    `:`
                        <span class="position-label">${s.name}</span>
                    `}
                </div>
            </div>
        `}),e.innerHTML=a}function zn(){const e=document.getElementById("tactics-bench");if(!e)return;const t=o.lineup.filter(s=>s).map(s=>s.id),n=o.players.filter(s=>!t.includes(s.id)),i={attacker:{name:"Aanvallers",color:"#9c27b0",players:n.filter(s=>_(s.position)==="attacker")},midfielder:{name:"Middenvelders",color:"#4caf50",players:n.filter(s=>_(s.position)==="midfielder")},defender:{name:"Verdedigers",color:"#2196f3",players:n.filter(s=>_(s.position)==="defender")},goalkeeper:{name:"Keepers",color:"#f9a825",players:n.filter(s=>_(s.position)==="goalkeeper")}};let a="";for(const[s,r]of Object.entries(i))r.players.length!==0&&(a+=`
            <div class="bench-group">
                <h4 style="color: ${r.color}">${r.name}</h4>
                <div class="bench-players-row">
        `,r.players.forEach(l=>{const c=S[l.position];a+=`
                <div class="bench-player"
                     data-player-id="${l.id}"
                     draggable="true"
                     ondragstart="handleBenchDragStart(event, ${l.id})">
                    <span class="bench-overall" style="background: ${c.color}">${l.overall}</span>
                    <span class="bench-flag">${l.nationality.flag}</span>
                    <span class="bench-name">${l.name.split(" ")[0]}</span>
                    <span class="bench-pos">${c.abbr}</span>
                </div>
            `}),a+="</div></div>");e.innerHTML=a}function Gn(){const e=Cn(),t=document.querySelector(".fit-fill"),n=document.querySelector(".fit-score"),i=document.querySelector(".fit-bonus");t&&(t.style.width=`${e}%`),n&&(n.textContent=`${e}%`),i&&(e>=90?(i.textContent="+15% Team Prestatie",i.className="fit-bonus excellent"):e>=80?(i.textContent="+10% Team Prestatie",i.className="fit-bonus good"):e>=70?(i.textContent="+5% Team Prestatie",i.className="fit-bonus ok"):e>=60?(i.textContent="Geen bonus",i.className="fit-bonus neutral"):(i.textContent=`${e>=50?"-5%":e>=40?"-10%":"-15%"} Team Prestatie`,i.className="fit-bonus bad"))}window.handleDragStart=function(e,t,n){P.sourceIndex=t,P.isFromBench=n,P.player=n?null:o.lineup[t],e.dataTransfer.effectAllowed="move"};window.handleBenchDragStart=function(e,t){const n=o.players.find(s=>s.id===t);P.player=n,P.isFromBench=!0,P.sourceIndex=null,e.dataTransfer.effectAllowed="move";let i=document.getElementById("drag-preview");i||(i=document.createElement("div"),i.id="drag-preview",i.className="drag-preview",document.body.appendChild(i));const a=S[n.position];i.innerHTML=`
        <div class="dp-overall" style="background: ${a?.color||"#666"}">${n.overall}</div>
        <div class="dp-name">${n.name.split(" ")[0]}</div>
    `,e.dataTransfer.setDragImage(i,30,30)};window.handleDragOver=function(e){e.preventDefault(),e.dataTransfer.dropEffect="move"};window.handleDrop=function(e,t){if(e.preventDefault(),P.isFromBench&&P.player)o.lineup[t],o.lineup[t]=P.player;else if(!P.isFromBench&&P.sourceIndex!==null){const n=o.lineup[t];o.lineup[t]=o.lineup[P.sourceIndex],o.lineup[P.sourceIndex]=n}Ht(),ye(),zn(),Gn()};function gt(){Rt(),Yn(),Kn(),vt(),Xn(),Xa()}function Yn(){const e=document.getElementById("tier-list-container");if(!e)return;const t=z.tribunes.find(a=>a.id===o.stadium.tribune)?.capacity||200,n=[{name:"Kelderklasse",minCap:0,maxCap:500,color:"#8b6914",icon:"⚽",facilities:["Horeca","Parking","Training"]},{name:"Amateur",minCap:500,maxCap:2e3,color:"#4ade80",icon:"🥉",facilities:["Medical","Fanshop","Kantine"]},{name:"Semi-Pro",minCap:2e3,maxCap:1e4,color:"#60a5fa",icon:"🥈",facilities:["VIP","Verlichting","Jeugd","Perszaal"]},{name:"Professioneel",minCap:1e4,maxCap:35e3,color:"#a855f7",icon:"🥇",facilities:["Sponsoring","Hotel","Elite Training"]},{name:"Elite",minCap:35e3,maxCap:999999,color:"#f59e0b",icon:"🏆",facilities:["Wereldklasse Alles"]}];let i='<h3>🏆 Capaciteit Niveaus</h3><div class="tier-list">';n.forEach((a,s)=>{const r=t>=a.minCap&&t<a.maxCap,l=t>=a.minCap,c=r?Math.min(100,(t-a.minCap)/(a.maxCap-a.minCap)*100):l?100:0;i+=`
            <div class="tier-item ${r?"current":""} ${l?"unlocked":"locked"}">
                <div class="tier-header" style="border-left: 4px solid ${a.color}">
                    <span class="tier-icon">${a.icon}</span>
                    <div class="tier-info">
                        <span class="tier-name">${a.name}</span>
                        <span class="tier-range">${a.minCap.toLocaleString()} - ${a.maxCap<999999?a.maxCap.toLocaleString():"∞"} cap</span>
                    </div>
                    ${r?'<span class="tier-badge">Huidig</span>':""}
                </div>
                <div class="tier-progress-bar">
                    <div class="tier-progress-fill" style="width: ${c}%; background: ${a.color}"></div>
                </div>
                <div class="tier-facilities">
                    ${a.facilities.map(u=>`<span class="tier-facility ${l?"":"locked"}">${u}</span>`).join("")}
                </div>
            </div>
        `}),i+="</div>",e.innerHTML=i}function Kn(){const e=document.getElementById("stadium-birdseye");if(!e)return;const t=s=>{if(s==="grass")return o.stadium.grass&&o.stadium.grass!=="grass_0";const r=o.stadium[s];if(Array.isArray(r))return r.length>0;const l=z[s]?.find(c=>c.id===r);return l&&l.cost>0},n=z.tribunes.find(s=>s.id===o.stadium.tribune)||{capacity:200};let i=`
    <svg viewBox="0 0 500 350" class="stadium-svg isometric" preserveAspectRatio="xMidYMid meet">
        <defs>
            <!-- Isometric grass pattern -->
            <pattern id="isoGrass1" patternUnits="userSpaceOnUse" width="30" height="30" patternTransform="skewY(-30)">
                <rect width="15" height="30" fill="#3d9e4f"/>
                <rect x="15" width="15" height="30" fill="#35913f"/>
            </pattern>
            <pattern id="isoGrass2" patternUnits="userSpaceOnUse" width="20" height="20">
                <rect width="20" height="20" fill="#2d7a35"/>
            </pattern>
        </defs>

        <!-- Ground/surrounding area -->
        <rect x="0" y="0" width="500" height="350" fill="#4a5568"/>

        <!-- Isometric football pitch -->
        <g transform="translate(250, 80)">
            <!-- Pitch base (isometric diamond) -->
            <polygon points="0,0 180,90 0,180 -180,90" fill="#3d9e4f" stroke="#2d7a35" stroke-width="2"/>

            <!-- Grass stripes -->
            <g opacity="0.3">
                <polygon points="-150,75 -120,60 -120,120 -150,105" fill="#2d7a35"/>
                <polygon points="-90,45 -60,30 -60,150 -90,135" fill="#2d7a35"/>
                <polygon points="-30,15 0,0 0,180 -30,165" fill="#2d7a35"/>
                <polygon points="30,15 60,30 60,150 30,165" fill="#2d7a35"/>
                <polygon points="90,45 120,60 120,120 90,135" fill="#2d7a35"/>
            </g>

            <!-- Pitch lines -->
            <g fill="none" stroke="white" stroke-width="1.5" opacity="0.9">
                <!-- Outline -->
                <polygon points="0,8 172,85 0,172 -172,85"/>

                <!-- Center line -->
                <line x1="-172,85" x2="172,85" y1="0" y2="0" transform="translate(0,90)"/>
                <line x1="-86" y1="47" x2="86" y2="133"/>

                <!-- Center circle -->
                <ellipse cx="0" cy="90" rx="35" ry="17.5"/>

                <!-- Center spot -->
                <circle cx="0" cy="90" r="2" fill="white"/>

                <!-- Left penalty area -->
                <polygon points="-172,55 -120,30 -120,150 -172,125"/>

                <!-- Right penalty area -->
                <polygon points="172,55 120,30 120,150 172,125"/>

                <!-- Goals (isometric) -->
                <g transform="translate(-178, 90)">
                    <rect x="-8" y="-15" width="8" height="30" fill="none" stroke="white" stroke-width="2"/>
                </g>
                <g transform="translate(178, 90)">
                    <rect x="0" y="-15" width="8" height="30" fill="none" stroke="white" stroke-width="2"/>
                </g>
            </g>
        </g>

        <!-- Main tribune (isometric) -->
        ${Wn(n.capacity)}

        <!-- Dugouts (isometric benches) -->
        <g transform="translate(200, 255)">
            <!-- Home dugout -->
            <polygon points="0,0 30,15 30,20 0,5" fill="#5d4037"/>
            <polygon points="0,0 0,5 -5,7.5 -5,2.5" fill="#3e2723"/>
            <polygon points="30,15 30,20 25,22.5 25,17.5" fill="#8d6e63"/>
        </g>
        <g transform="translate(270, 255)">
            <!-- Away dugout -->
            <polygon points="0,0 30,15 30,20 0,5" fill="#5d4037"/>
            <polygon points="0,0 0,5 -5,7.5 -5,2.5" fill="#3e2723"/>
            <polygon points="30,15 30,20 25,22.5 25,17.5" fill="#8d6e63"/>
        </g>

        <!-- Facility buildings (isometric) - only show if built -->
        ${Un(t)}
    </svg>`;e.innerHTML=i;const a=document.getElementById("stadium-capacity");a&&(a.textContent=n.capacity||200)}function Wn(e){const t=Math.min(6,Math.max(1,Math.ceil(e/400))),n=Math.min(200,Math.max(80,e/25));let i='<g transform="translate(250, 280)">';const a=n;for(let s=0;s<t;s++){const r=-s*6,c=(a-s*6)/2;i+=`
            <g transform="translate(0, ${r})">
                <!-- Top face -->
                <polygon points="${-c},0 0,${-c/2} ${c},0 0,${c/2}"
                         fill="${s%2===0?"#ef5350":"#e53935"}"/>
                <!-- Front face -->
                <polygon points="${-c},0 ${-c},5 0,${c/2+5} 0,${c/2}"
                         fill="#c62828"/>
                <!-- Side face -->
                <polygon points="${c},0 ${c},5 0,${c/2+5} 0,${c/2}"
                         fill="#b71c1c"/>
            </g>
        `}if(e>1e3){const s=-t*6-15;i+=`
            <g transform="translate(0, ${s})">
                <!-- Roof supports -->
                <line x1="${-n/2+10}" y1="${n/4}" x2="${-n/2+10}" y2="${n/4+30}" stroke="#424242" stroke-width="3"/>
                <line x1="${n/2-10}" y1="${-n/4}" x2="${n/2-10}" y2="${-n/4+30}" stroke="#424242" stroke-width="3"/>
                <!-- Roof -->
                <polygon points="${-n/2},5 0,${-n/4} ${n/2},5 0,${n/4+5}"
                         fill="#546e7a" opacity="0.9"/>
            </g>
        `}return i+="</g>",i}function Un(e){const t={training:{x:50,y:120,color:"#4caf50",roofColor:"#388e3c",label:"⚽",height:20},medical:{x:50,y:180,color:"#f44336",roofColor:"#d32f2f",label:"🏥",height:18},academy:{x:50,y:240,color:"#2196f3",roofColor:"#1976d2",label:"🎓",height:25},scouting:{x:450,y:120,color:"#673ab7",roofColor:"#512da8",label:"🔭",height:18},perszaal:{x:450,y:180,color:"#607d8b",roofColor:"#455a64",label:"📺",height:22},sponsoring:{x:450,y:240,color:"#ffc107",roofColor:"#ffa000",label:"💰",height:20},horeca:{x:120,y:320,color:"#ff5722",roofColor:"#e64a19",label:"🍟",height:16,hasAwning:!0},kantine:{x:180,y:320,color:"#795548",roofColor:"#5d4037",label:"🍺",height:18},fanshop:{x:240,y:320,color:"#00bcd4",roofColor:"#0097a7",label:"👕",height:16},vip:{x:300,y:320,color:"#9c27b0",roofColor:"#7b1fa2",label:"⭐",height:24},lighting:{x:360,y:320,color:"#78909c",roofColor:"#546e7a",label:"💡",height:35,isTower:!0},parking:{x:80,y:50,color:"#455a64",roofColor:"#37474f",label:"🅿️",height:8,isFlat:!0},hotel:{x:420,y:50,color:"#8d6e63",roofColor:"#6d4c41",label:"🏨",height:35}};let n="";return Object.entries(t).forEach(([i,a])=>{if(!e(i))return;const s=28,r=14,l=a.height;a.isTower?n+=`
                <g transform="translate(${a.x}, ${a.y})" class="iso-facility" data-facility="${i}">
                    <!-- Tower base -->
                    <polygon points="0,0 8,4 8,${l+4} 0,${l}" fill="#546e7a"/>
                    <polygon points="0,0 -8,4 -8,${l+4} 0,${l}" fill="#78909c"/>
                    <!-- Light top -->
                    <ellipse cx="0" cy="-2" rx="6" ry="3" fill="#ffeb3b"/>
                    <ellipse cx="0" cy="-2" rx="3" ry="1.5" fill="#fff59d"/>
                    <!-- Label -->
                    <text x="0" y="${l+18}" text-anchor="middle" font-size="10">${a.label}</text>
                </g>
            `:a.isFlat?n+=`
                <g transform="translate(${a.x}, ${a.y})" class="iso-facility" data-facility="${i}">
                    <!-- Parking surface -->
                    <polygon points="0,0 ${s},${r} 0,${r*2} ${-s},${r}" fill="${a.color}"/>
                    <!-- Parking lines -->
                    <g stroke="white" stroke-width="1" opacity="0.5">
                        <line x1="${-s+8}" y1="${r}" x2="${s-8}" y2="${r}"/>
                        <line x1="${-s/2}" y1="${r/2}" x2="${-s/2}" y2="${r*1.5}"/>
                        <line x1="0" y1="0" x2="0" y2="${r*2}"/>
                        <line x1="${s/2}" y1="${r/2}" x2="${s/2}" y2="${r*1.5}"/>
                    </g>
                    <!-- Label -->
                    <text x="0" y="${r*2+14}" text-anchor="middle" font-size="10">${a.label}</text>
                </g>
            `:n+=`
                <g transform="translate(${a.x}, ${a.y})" class="iso-facility" data-facility="${i}">
                    <!-- Building right face -->
                    <polygon points="0,0 ${s},${r} ${s},${r+l} 0,${l}" fill="${a.color}"/>
                    <!-- Building left face -->
                    <polygon points="0,0 ${-s},${r} ${-s},${r+l} 0,${l}" fill="${a.roofColor}"/>
                    <!-- Building top/roof -->
                    <polygon points="0,${-r} ${s},0 0,${r} ${-s},0" fill="${a.roofColor}" opacity="0.8"/>
                    ${a.hasAwning?`
                        <!-- Awning -->
                        <polygon points="${-s-5},${r+l-8} 5,${l-8} 5,${l-5} ${-s-5},${r+l-5}"
                                 fill="#fff" stroke="#e0e0e0" stroke-width="0.5"/>
                        <polygon points="${-s-5},${r+l-5} 5,${l-5} 5,${l-3} ${-s-5},${r+l-3}"
                                 fill="#ff8a65"/>
                    `:""}
                    <!-- Windows (simple) -->
                    <g fill="rgba(255,255,255,0.3)">
                        <rect x="${s/2-4}" y="${r+4}" width="6" height="4" rx="0.5"/>
                        <rect x="${s/2-4}" y="${r+l/2}" width="6" height="4" rx="0.5"/>
                    </g>
                    <!-- Label -->
                    <text x="0" y="${r+l+14}" text-anchor="middle" font-size="10">${a.label}</text>
                </g>
            `}),n}const Jn={veld:{name:"Veld",keys:["grass","lighting"]},tribunes:{name:"Tribunes",keys:["tribunes","vip"]},horeca:{name:"Horeca",keys:["horeca","kantine"]},winkels:{name:"Winkels",keys:["fanshop"]},training:{name:"Training",keys:["training","academy"]},medisch:{name:"Medisch",keys:["medical"]},scouting:{name:"Scouting",keys:["scouting"]},commercieel:{name:"Commercieel",keys:["sponsoring","perszaal"]},overig:{name:"Overig",keys:["parking","hotel"]}},Zn={tribunes:'<svg viewBox="0 0 24 24" fill="none" stroke="#8b4513" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><rect x="9" y="12" width="6" height="9"/></svg>',grass:'<svg viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2"><path d="M4 20c2-4 4-8 8-8s6 4 8 8"/><path d="M12 4v8"/><path d="M8 8c2 0 4 2 4 4"/><path d="M16 8c-2 0-4 2-4 4"/></svg>',horeca:'<svg viewBox="0 0 24 24" fill="none" stroke="#ff7043" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20h16l-2-8H6l-2 8z"/></svg>',fanshop:'<svg viewBox="0 0 24 24" fill="none" stroke="#00bcd4" stroke-width="2"><path d="M6 4h12l2 5H4l2-5z"/><path d="M4 9v11h16V9"/><path d="M9 9v11M15 9v11"/></svg>',vip:'<svg viewBox="0 0 24 24" fill="none" stroke="#9c27b0" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 12l2 4 2-4M15 10v6M17 10l-2 3 2 3"/></svg>',parking:'<svg viewBox="0 0 24 24" fill="none" stroke="#607d8b" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 16V8h4a3 3 0 010 6H9"/></svg>',lighting:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffeb3b" stroke-width="2"><circle cx="12" cy="6" r="4"/><path d="M12 10v10M8 20h8"/></svg>',training:'<svg viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>',medical:'<svg viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 8v8M8 12h8"/></svg>',academy:'<svg viewBox="0 0 24 24" fill="none" stroke="#2196f3" stroke-width="2"><path d="M12 3l9 4.5v9L12 21l-9-4.5v-9L12 3z"/><path d="M12 12v9M12 12L3 7.5M12 12l9-4.5"/></svg>',scouting:'<svg viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="2"><circle cx="10" cy="10" r="6"/><path d="M14 14l6 6"/></svg>',sponsoring:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffc107" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 6v2M12 16v2M9 9c0-1 1-2 3-2s3 1 3 2-1 2-3 2-3 1-3 2 1 2 3 2 3-1 3-2"/></svg>',kantine:'<svg viewBox="0 0 24 24" fill="none" stroke="#8d6e63" stroke-width="2"><path d="M4 11h16M4 11V8a4 4 0 014-4h8a4 4 0 014 4v3M4 11v9h16v-9"/></svg>',perszaal:'<svg viewBox="0 0 24 24" fill="none" stroke="#37474f" stroke-width="2"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>',hotel:'<svg viewBox="0 0 24 24" fill="none" stroke="#795548" stroke-width="2"><path d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/><rect x="8" y="6" width="3" height="3"/><rect x="13" y="6" width="3" height="3"/><rect x="8" y="11" width="3" height="3"/><rect x="13" y="11" width="3" height="3"/><rect x="10" y="16" width="4" height="5"/></svg>'};let yt="veld";function Xn(){document.querySelectorAll(".upgrade-tab").forEach(e=>{e.addEventListener("click",()=>{yt=e.dataset.category,document.querySelectorAll(".upgrade-tab").forEach(t=>t.classList.remove("active")),e.classList.add("active"),vt()})})}function vt(){const e=document.getElementById("stadium-upgrades-content");if(!e)return;const t=z.tribunes.find(s=>s.id===o.stadium.tribune)?.capacity||200,n=Jn[yt];if(!n)return;const i=["tribunes","grass","training","medical","academy","scouting","lighting","sponsoring","kantine","perszaal","hotel"];let a="";n.keys.forEach(s=>{const r=z[s];if(!r)return;const l=s==="tribunes"?o.stadium.tribune:i.includes(s)?o.stadium[s]:null,c=Array.isArray(o.stadium[s])?o.stadium[s]:[];r.forEach(u=>{const d=l===u.id,f=c.includes(u.id),p=u.required>t,m=o.club.budget>=u.cost;let h="",y="";d||f?(h="owned",y='<span class="upgrade-status">Gebouwd</span>'):p?(h="locked",y=`<span class="upgrade-price">${u.required}+ cap</span>`):m?(h="",y=`<span class="upgrade-price">${v(u.cost)}</span><button class="btn-build" data-category="${s}" data-upgrade="${u.id}">Bouwen</button>`):(h="",y=`<span class="upgrade-price">${v(u.cost)}</span><button class="btn-build" disabled>Te duur</button>`);let x="";u.capacity?x=`${u.capacity} plaatsen`:u.income?x=`+${v(u.income)}/bezoeker`:u.dailyIncome?x=`+${v(u.dailyIncome)}/dag`:u.multiplier?x=`${u.multiplier}x groei`:u.effect&&(x=u.effect),a+=`
                <div class="stadium-upgrade-item ${h}" data-facility="${s}">
                    <div class="upgrade-icon">${Zn[s]||""}</div>
                    <div class="upgrade-info">
                        <h5>${u.name}</h5>
                        <p>${x}</p>
                    </div>
                    <div class="upgrade-action">${y}</div>
                </div>
            `})}),e.innerHTML=a||'<p style="color: var(--text-muted); text-align: center;">Geen upgrades beschikbaar</p>',e.querySelectorAll(".btn-build:not([disabled])").forEach(s=>{s.addEventListener("click",r=>{r.stopPropagation(),Qn(s.dataset.category,s.dataset.upgrade)})}),e.querySelectorAll(".stadium-upgrade-item").forEach(s=>{const r=s.dataset.facility;s.addEventListener("mouseenter",()=>Ue(r,!0)),s.addEventListener("mouseleave",()=>Ue(r,!1))})}function Ue(e,t){const i={horeca:"facility-horeca",fanshop:"facility-fanshop",vip:"facility-vip",parking:"facility-parking",training:"facility-training",medical:"facility-medical",academy:"facility-academy",scouting:"facility-scouting",lighting:"facility-lighting",sponsoring:"facility-sponsoring",kantine:"facility-kantine",perszaal:"facility-perszaal",hotel:"facility-hotel",grass:"facility-grass",tribunes:"facility-tribune"}[e];if(!i)return;const a=document.getElementById(i);a&&(t?a.classList.add("preview-highlight"):a.classList.remove("preview-highlight"))}function Qn(e,t){const i=z[e]?.find(a=>a.id===t);!i||o.club.budget<i.cost||confirm(`Wil je ${i.name} bouwen voor ${v(i.cost)}?`)&&(o.club.budget-=i.cost,["tribunes","grass","training","medical","academy","scouting","lighting","sponsoring","kantine","perszaal","hotel"].includes(e)?(o.stadium[e==="tribunes"?"tribune":e]=t,e==="tribunes"&&(o.stadium.capacity=i.capacity)):(Array.isArray(o.stadium[e])||(o.stadium[e]=[]),o.stadium[e].push(t)),R(),gt())}let Ee=!1;function te(){const e=document.getElementById("scout-results"),t=document.getElementById("results-count");document.getElementById("scout-empty");const n=document.getElementById("scout-budget"),i=document.getElementById("scout-hire-card"),a=document.getElementById("scout-interface"),s=o.hiredStaff?.medisch?.includes("st_scout");if(i&&(i.style.display=s?"none":"flex"),a&&(a.style.display=s?"grid":"none"),n&&(n.textContent=v(o.club.budget)),!e)return;const r=o.scoutSearch.results;if(t&&(t.textContent=`${r.length} speler${r.length!==1?"s":""} gevonden`),r.length===0){e.innerHTML=`
            <div class="scout-empty-state" id="scout-empty">
                <div class="empty-icon">🔍</div>
                <h4>Geen rapporten</h4>
                <p>Stuur je scout op pad om talent te vinden</p>
            </div>
        `;return}let l=`
        <div class="scout-info-box">
            <div class="scout-info-icon">💡</div>
            <div class="scout-info-content">
                <strong>Hoe werkt scouten?</strong>
                <ul>
                    <li><strong>🔍 Opnieuw scouten</strong> = smallere ranges, meer zekerheid (kost geld)</li>
                    <li><strong>✕ Afwijzen</strong> = speler verdwijnt, morgen nieuwe kans</li>
                    <li>Durf je te gokken of wil je zekerheid?</li>
                </ul>
            </div>
        </div>
    `;r.forEach(c=>{const u=c.price===0?"Transfervrij":v(c.price),d=c.price===0?"free":"",f=c.scoutRanges||{overall:{min:c.overall-3,max:c.overall+3},potential:{min:c.potential-5,max:c.potential+5},attack:{min:c.attack-25,max:c.attack+25},defense:{min:c.defense-25,max:c.defense+25},speed:{min:c.speed-25,max:c.speed+25},stamina:{min:c.stamina-25,max:c.stamina+25}},p=c.scoutCount||1,m=_e(p),h=p>=5,y=$=>{const A=Math.max(1,$.min),C=Math.min(99,$.max),I=(A+C)/2,N=Math.round(I/20*2)/2;return Math.min(5,Math.max(0,N))},x=$=>{let A="";const C=Math.floor($),I=$%1!==0,N=5-C-(I?1:0);for(let F=0;F<C;F++)A+='<span class="star full">★</span>';I&&(A+='<span class="star half">★</span>');for(let F=0;F<N;F++)A+='<span class="star empty">☆</span>';return A},k=($,A)=>{const C=Math.max(1,A.min),I=Math.min(99,A.max),N=I-C;return`
                <div class="scout-attr-range">
                    <span class="scout-attr-label">${$}</span>
                    <div class="scout-range-bar">
                        <div class="scout-range-track">
                            <div class="scout-range-fill" style="left: ${C}%; width: ${N}%"></div>
                        </div>
                        <span class="scout-range-value">${C}-${I}</span>
                    </div>
                </div>
            `},b=y(f.potential),M=b>=5;l+=`
            <div class="scout-result-card" data-player-id="${c.id}">
                <div class="scout-result-header" style="background: ${S[c.position].color}">
                    <div class="scout-header-top">
                        <span class="scout-count-badge" title="${p}x gescout">🔍 ${p}x</span>
                        <span class="scout-result-position">${S[c.position].abbr}</span>
                        <span class="scout-result-flag">${c.nationality.flag}</span>
                    </div>
                    <div class="scout-ratings">
                        <div class="scout-rating">
                            <span class="scout-rating-range">${f.overall.min}-${f.overall.max}</span>
                            <span class="scout-rating-label">ALG</span>
                        </div>
                        <div class="scout-rating potential ${M?"star-player":""}">
                            <span class="scout-stars">${x(b)}</span>
                            <span class="scout-rating-label">${M?"⭐ STER":"POT"}</span>
                        </div>
                    </div>
                </div>
                <div class="scout-result-body">
                    <span class="scout-result-name">${c.name}</span>
                    <span class="scout-result-age">${c.age} jaar</span>

                    <div class="scout-attributes-ranges">
                        ${k("AAN",f.attack)}
                        ${k("VER",f.defense)}
                        ${k("SNE",f.speed)}
                        ${k("CON",f.stamina)}
                    </div>

                    <div class="scout-result-actions">
                        <div class="scout-price-row">
                            <span class="scout-result-price ${d}">${u}</span>
                        </div>
                        <div class="scout-buttons">
                            <button class="btn btn-dismiss" data-player-id="${c.id}" title="Niet interessant - morgen nieuwe speler">
                                ✕
                            </button>
                            ${h?`
                                <span class="scout-maxed">✓ Volledig</span>
                            `:`
                                <button class="btn btn-secondary btn-rescout" data-player-id="${c.id}" title="Nogmaals scouten voor meer zekerheid">
                                    🔍 ${v(m)}
                                </button>
                            `}
                            <button class="btn btn-primary btn-scout-hire" data-player-id="${c.id}">
                                Aannemen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `}),e.innerHTML=l,document.querySelectorAll(".btn-scout-hire").forEach(c=>{c.addEventListener("click",u=>{u.stopPropagation();const d=parseFloat(c.dataset.playerId);ei(d)})}),document.querySelectorAll(".btn-rescout").forEach(c=>{c.addEventListener("click",u=>{u.stopPropagation();const d=parseFloat(c.dataset.playerId),f=Bn(d);f.success||alert(f.message)})}),document.querySelectorAll(".btn-dismiss").forEach(c=>{c.addEventListener("click",u=>{u.stopPropagation();const d=parseFloat(c.dataset.playerId);Ln(d)})})}function ei(e){const t=o.scoutSearch.results.find(n=>n.id===e);if(t){if(t.price>o.club.budget){alert("Je hebt niet genoeg budget!");return}o.club.budget-=t.price,o.players.push(t),o.scoutSearch.results=o.scoutSearch.results.filter(n=>n.id!==e),R(),te(),alert(`${t.name} is toegevoegd aan je selectie!`)}}function ti(){if(Ee)return;const e=document.getElementById("scout-search-btn"),t=document.getElementById("scout-status"),n=document.getElementById("scout-min-age"),i=document.getElementById("scout-max-age"),a=document.getElementById("scout-position"),s=parseInt(n?.value)||16,r=parseInt(i?.value)||35,l=a?.value||"all";Ee=!0,e&&(e.classList.add("scouting"),e.innerHTML='<span class="btn-scout-icon">⏳</span><span class="btn-scout-text">Scouten...</span>'),t&&(t.classList.add("active"),t.innerHTML=`
            <p class="scout-status-text">Scout is onderweg...</p>
            <div class="scout-progress">
                <div class="scout-progress-fill" id="scout-progress-fill" style="width: 0%"></div>
            </div>
        `);let c=0;const u=2e3,d=50,f=u/d,p=setInterval(()=>{c+=100/f;const m=document.getElementById("scout-progress-fill");m&&(m.style.width=`${Math.min(c,100)}%`)},d);setTimeout(()=>{clearInterval(p),Ee=!1,o.scoutSearch.minAge=s,o.scoutSearch.maxAge=r,o.scoutSearch.position=l,o.scoutSearch.results=In(l,s,r,3),e&&(e.classList.remove("scouting"),e.innerHTML='<span class="btn-scout-icon">🔍</span><span class="btn-scout-text">Scout Versturen</span>'),t&&(t.classList.remove("active"),t.innerHTML=`<p class="scout-status-text">${o.scoutSearch.results.length} spelers gevonden!</p>`),te()},u)}function ni(){const e=document.getElementById("scout-search-btn"),t=document.getElementById("scout-min-age"),n=document.getElementById("scout-max-age"),i=document.getElementById("age-range-display");e&&e.addEventListener("click",ti);function a(){if(i&&t&&n){const s=t.value,r=n.value;i.textContent=`${s} - ${r}`}}t&&t.addEventListener("input",a),n&&n.addEventListener("input",a)}const He={aan:{name:"Aanvalstrainer",stat:"AAN",color:"#c62828"},ver:{name:"Verdedigingstrainer",stat:"VER",color:"#1565c0"},sne:{name:"Snelheidstrainer",stat:"SNE",color:"#ef6c00"},fys:{name:"Fitnesstrainer",stat:"FYS",color:"#7b1fa2"}},Je={goalkeeper:"Keeper",defender:"Verdediger",midfielder:"Middenvelder",attacker:"Aanvaller"};function ve(){ii(),bt(),kt(),si()}function ii(){const e=document.querySelectorAll(".training-tab"),t=document.querySelectorAll(".training-panel");e.forEach(n=>{n.addEventListener("click",()=>{const i=n.dataset.trainingTab;e.forEach(a=>a.classList.remove("active")),n.classList.add("active"),t.forEach(a=>{a.classList.remove("active"),a.id===`${i}-training-panel`&&a.classList.add("active")})})})}const Le=[{id:"keeper",name:"Keeper",icon:"🧤",trainerId:"tr_keeper",positions:["keeper"]},{id:"verdediging",name:"Verdediging",icon:"🛡️",trainerId:"tr_verdediging",positions:["cb","lb","rb"]},{id:"middenveld",name:"Middenveld",icon:"⚙️",trainerId:"tr_middenveld",positions:["cdm","cm","cam","lm","rm"]},{id:"aanval",name:"Aanval",icon:"⚽",trainerId:"tr_aanval",positions:["lw","rw","cf","st"]}];function bt(){const e=document.getElementById("position-training-grid");if(!e)return;o.hiredStaff||(o.hiredStaff={trainers:[],medisch:[]});let t="";Le.forEach(i=>{const a=o.hiredStaff.trainers?.includes(i.trainerId),s=o.players.filter(r=>i.positions.includes(r.position));t+=`
            <div class="position-train-card ${a?"has-trainer":"locked"}">
                <div class="ptc-icon">${i.icon}</div>
                <div class="ptc-name">${i.name}</div>
                <div class="ptc-players">${s.length} spelers</div>
                <div class="ptc-status ${a?"has-trainer":"no-trainer"}">
                    ${a?"✓ Trainer beschikbaar":"✗ Geen trainer"}
                </div>
                ${a?`
                    <button class="btn btn-sm btn-primary" onclick="openPositionTrainingModal('${i.id}')">
                        Train
                    </button>
                `:`
                    <button class="btn btn-sm btn-secondary" onclick="navigateTo('staff')">
                        Neem trainer aan
                    </button>
                `}
            </div>
        `}),e.innerHTML=t;const n=document.querySelector(".training-hint");if(n){const i=Le.some(a=>o.hiredStaff.trainers?.includes(a.trainerId));n.style.display=i?"none":"block"}}window.openPositionTrainingModal=function(e){const t=Le.find(s=>s.id===e);if(!t)return;const n=o.players.filter(s=>t.positions.includes(s.position));if(n.length===0){E("Geen spelers beschikbaar voor deze positie","warning");return}const i=document.createElement("div");i.className="modal-overlay",i.id="position-training-modal";let a=n.map(s=>`
        <div class="training-player-option" onclick="trainPlayer('${s.id}', '${e}')">
            <div class="tpo-pos">${s.position.toUpperCase()}</div>
            <div class="tpo-name">${s.name}</div>
            <div class="tpo-overall">${s.overall}</div>
            <div class="tpo-condition" style="color: ${s.condition>=70?"var(--primary-green)":"#c62828"}">
                ${s.condition}%
            </div>
        </div>
    `).join("");i.innerHTML=`
        <div class="modal-backdrop" onclick="closePositionTrainingModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closePositionTrainingModal()">&times;</button>
            <h3>Train ${t.name}</h3>
            <p class="modal-subtitle">Selecteer een speler om te trainen</p>
            <div class="training-player-list">
                ${a}
            </div>
        </div>
    `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("active"))};window.closePositionTrainingModal=function(){const e=document.getElementById("position-training-modal");e&&(e.classList.remove("active"),setTimeout(()=>e.remove(),200))};window.trainPlayer=function(e,t){const n=o.players.find(r=>r.id===e);if(!n)return;const i=["speed","physical","technique","attack","defense"],a=i[Math.floor(Math.random()*i.length)],s=Math.floor(Math.random()*3)+1;n[a]!==void 0&&(n[a]=Math.min(99,n[a]+s),n.overall=Math.floor((n.attack+n.defense+n.speed+n.physical)/4)),n.condition=Math.max(0,n.condition-10),closePositionTrainingModal(),O(),E(`${n.name} getraind! +${s} ${a}`,"success"),bt()};const ai={1:{name:"Heel Rustig",condition:2,energy:-1,desc:"Lichte hersteltraining. Ideaal na zware wedstrijden."},2:{name:"Rustig",condition:4,energy:-2,desc:"Lichte training met focus op herstel en techniek."},3:{name:"Normaal",condition:5,energy:-3,desc:"Gebalanceerde training voor stabiele ontwikkeling."},4:{name:"Intens",condition:7,energy:-5,desc:"Zware training. Verbetert conditie snel maar kost energie."},5:{name:"Bruut Intens",condition:10,energy:-8,desc:"Extreme training! Maximale conditiegroei maar uitputtend."}};function si(){const e=document.getElementById("training-intensity");e&&(o.training.intensity||(o.training.intensity=3),e.value=o.training.intensity,Ze(o.training.intensity),e.addEventListener("input",t=>{const n=parseInt(t.target.value);o.training.intensity=n,Ze(n)}))}function Ze(e){const t=ai[e];if(!t)return;const n=document.getElementById("intensity-condition");n&&(n.textContent=`+${t.condition}%`);const i=document.getElementById("intensity-energy");i&&(i.textContent=`${t.energy}%`);const a=document.getElementById("intensity-description");a&&(a.innerHTML=`<strong>${t.name}</strong> - ${t.desc}`),document.querySelectorAll(".intensity-step").forEach(s=>{const r=parseInt(s.dataset.level);s.classList.toggle("active",r<=e)})}function oi(){const e=document.getElementById("assistant-grid");if(!e)return;let t="";Object.entries(at).forEach(([n,i])=>{const a=o.assistantTrainers[n]!==null,s=o.club.budget>=i.cost;a?t+=`
                <div class="assistant-card hired">
                    <div class="assistant-icon">${i.icon}</div>
                    <div class="assistant-name">${i.name}</div>
                    <div class="assistant-effect">${i.effect}</div>
                    <div class="assistant-hired">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        Actief
                    </div>
                    <div class="assistant-salary">${v(i.weeklySalary)}/week</div>
                </div>
            `:t+=`
                <div class="assistant-card ${s?"":"locked"}" onclick="${s?`hireAssistant('${n}')`:""}">
                    <div class="assistant-icon">${i.icon}</div>
                    <div class="assistant-name">${i.name}</div>
                    <div class="assistant-effect">${i.effect}</div>
                    <div class="assistant-cost">${v(i.cost)}</div>
                    <div class="assistant-salary">+ ${v(i.weeklySalary)}/week</div>
                </div>
            `}),e.innerHTML=t}function ri(e){const t=at[e];if(t){if(o.club.budget<t.cost){alert("Niet genoeg budget!");return}if(o.assistantTrainers[e]!==null){alert("Deze assistent is al in dienst!");return}o.club.budget-=t.cost,o.assistantTrainers[e]={hiredAt:Date.now(),weeklySalary:t.weeklySalary},R(),oi(),console.log(`✅ ${t.name} ingehuurd!`)}}function li(){const e=document.getElementById("staff-panel"),t=document.getElementById("staff-grid"),n=document.getElementById("staff-unlock-info");if(!e||!t||!n)return;const i=o.club.division;if(!(i<=5)){n.textContent=`🔒 Beschikbaar vanaf 3e Klasse (nog ${5-i} divisie${5-i>1?"s":""} te gaan)`,n.classList.add("locked"),t.innerHTML="";let r="";Object.entries(Ae).forEach(([l,c])=>{r+=`
                <div class="staff-card locked">
                    <div class="staff-icon">${c.icon}</div>
                    <div class="staff-name">${c.name}</div>
                    <div class="staff-desc">${c.description}</div>
                    <div class="staff-effect">${c.effect}</div>
                </div>
            `}),t.innerHTML=r;return}n.textContent="Huur stafleden in om je club te verbeteren",n.classList.remove("locked");let s="";Object.entries(Ae).forEach(([r,l])=>{if(o.staff[r]!==null)s+=`
                <div class="staff-card hired">
                    <div class="staff-icon">${l.icon}</div>
                    <div class="staff-name">${l.name}</div>
                    <div class="staff-desc">${l.description}</div>
                    <div class="staff-effect">${l.effect}</div>
                    <div class="staff-hired-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        In dienst
                    </div>
                    <div class="staff-salary">${v(l.weeklySalary)}/week</div>
                </div>
            `;else{const u=o.club.budget>=l.cost;s+=`
                <div class="staff-card ${u?"":"locked"}" onclick="${u?`hireStaff('${r}')`:""}">
                    <div class="staff-icon">${l.icon}</div>
                    <div class="staff-name">${l.name}</div>
                    <div class="staff-desc">${l.description}</div>
                    <div class="staff-effect">${l.effect}</div>
                    <div class="staff-cost">${v(l.cost)} eenmalig</div>
                    <div class="staff-salary">+ ${v(l.weeklySalary)}/week</div>
                    <button class="btn btn-primary btn-small" ${u?"":"disabled"}>
                        ${u?"Inhuren":"Te duur"}
                    </button>
                </div>
            `}}),t.innerHTML=s}function ci(e){const t=Ae[e];if(t){if(o.club.budget<t.cost){alert("Niet genoeg budget!");return}if(o.staff[e]!==null){alert("Deze stafrol is al ingevuld!");return}o.club.budget-=t.cost,o.staff[e]={hiredAt:Date.now(),weeklySalary:t.weeklySalary},R(),li(),console.log(`✅ ${t.name} ingehuurd!`)}}function xt(){Object.keys(He).forEach(e=>{const t=document.getElementById(`train-player-${e}`),n=document.getElementById(`train-timer-${e}`),i=document.querySelector(`.trainer-card[data-trainer="${e}"]`),a=i?.querySelector(".tc-btn");if(!t||!n||!i||!a)return;const s=o.training.trainerStatus[e];if(s.busy&&s.playerId){const r=o.players.find(c=>c.id===s.playerId),l=di(e);t.textContent=r?r.name.split(" ")[0]:"-",t.classList.add("has-player"),n.textContent=je(l),n.classList.add("counting"),i.classList.add("training"),a.textContent="Annuleren",a.onclick=()=>mi(e)}else t.textContent="-",t.classList.remove("has-player"),n.textContent="",n.classList.remove("counting"),i.classList.remove("training"),a.textContent="Speler toewijzen",a.onclick=()=>ui(e)})}function di(e){const t=o.training.trainerStatus[e];if(!t.startTime)return 0;const n=Date.now()-t.startTime;return Math.max(0,o.training.sessionDuration-n)}let fe=null;function ui(e){fe=e;const t=He[e],n=Object.values(o.training.trainerStatus).filter(d=>d.busy&&d.playerId).map(d=>d.playerId),i=o.players.filter(d=>!n.includes(d.id));if(i.length===0){alert("Geen spelers beschikbaar voor training.");return}const a=t.stat;i.sort((d,f)=>(f.attributes[a]||0)-(d.attributes[a]||0));const s=document.getElementById("training-select-modal"),r=document.getElementById("training-modal-title"),l=document.getElementById("training-modal-subtitle"),c=document.getElementById("training-player-list");r.textContent=`${a} Training`,l.textContent=`Selecteer een speler om ${t.name} te trainen`;let u="";i.forEach(d=>{const f=S[d.position]||{abbr:"??",color:"#666"};d.photo||he(d.name,d.position);const p=d.attributes[a]||0,m=ht(d.potential,d.age);u+=`
            <div class="training-player-card" onclick="selectTrainingPlayer(${d.id})">
                <div class="tpc-ratings">
                    <div class="tpc-overall" style="background: ${f.color}">
                        <span class="tpc-overall-val">${d.overall}</span>
                        <span class="tpc-overall-lbl">OVR</span>
                    </div>
                    <div class="tpc-potential" style="background: ${f.color}; opacity: 0.85">
                        <span class="tpc-potential-val">${m}</span>
                        <span class="tpc-potential-lbl">POT</span>
                    </div>
                </div>
                <div class="tpc-info">
                    <span class="tpc-name">${d.name}</span>
                    <div class="tpc-meta">
                        <span class="tpc-flag">${d.nationality.flag}</span>
                        <span class="tpc-pos" style="background: ${f.color}">${f.abbr}</span>
                        <span class="tpc-age">${d.age}j</span>
                    </div>
                </div>
                <div class="tpc-stat">
                    <div class="tpc-stat-value">${p}</div>
                    <div class="tpc-stat-label">${a}</div>
                </div>
            </div>
        `}),c.innerHTML=u,s.classList.add("active")}function wt(){document.getElementById("training-select-modal").classList.remove("active"),fe=null}function fi(e){fe&&(pi(fe,e),wt())}function pi(e,t){o.training.trainerStatus[e]={busy:!0,playerId:t,startTime:Date.now()},xt()}function mi(e){o.training.trainerStatus[e]={busy:!1},xt()}function kt(){document.querySelectorAll(".team-training-option").forEach(t=>{const n=t.dataset.type,i=t.querySelector("button");o.training.teamTraining.selected===n?(t.classList.add("selected"),i.textContent="Geselecteerd",i.classList.add("btn-primary"),i.classList.remove("btn-secondary")):(t.classList.remove("selected"),i.textContent="Selecteer",i.classList.remove("btn-primary"),i.classList.add("btn-secondary"))})}function hi(){Object.keys(o.training.slots).forEach(e=>{const t=o.training.slots[e];if(t.playerId&&t.startTime){const n=gi(e),i=document.querySelector(`.tp-timer[data-slot="${e}"]`);n<=0?xi(e):i&&(i.textContent=je(n))}})}function gi(e){const t=o.training.slots[e];if(!t.startTime)return 0;const n=Date.now()-t.startTime;return Math.max(0,o.training.sessionDuration-n)}function yi(e){const t=o.players.filter(s=>{const r=S[s.position];return!r||r.group!==e?!1:!Object.values(o.training.slots).some(c=>c.playerId===s.id)});if(t.length===0){alert(`Geen ${Je[e].toLowerCase()}s beschikbaar voor training.`);return}const n=Object.entries(o.training.trainerStatus).find(([s,r])=>!r.busy);if(!n){alert("Alle trainers zijn momenteel bezet.");return}const i=t.map((s,r)=>`${r+1}. ${s.name} (${s.overall})`).join(`
`),a=prompt(`Selecteer een ${Je[e].toLowerCase()} om te trainen:

${i}

Voer het nummer in:`);if(a){const s=parseInt(a)-1;s>=0&&s<t.length&&vi(e,t[s].id,n[0])}}function vi(e,t,n){o.training.slots[e]={playerId:t,startTime:Date.now(),trainerId:n},o.training.trainerStatus[n]={busy:!0,assignedSlot:e},ve()}function bi(e){const t=o.training.slots[e];t.trainerId&&(o.training.trainerStatus[t.trainerId]={busy:!1,assignedSlot:null}),St(e),ve()}function St(e){o.training.slots[e]={playerId:null,startTime:null,trainerId:null}}function xi(e){const t=o.training.slots[e],n=o.players.find(a=>a.id===t.playerId),i=He[t.trainerId];n&&i&&(n.attributes[i.stat]=Math.min(99,n.attributes[i.stat]+1),n.overall=pt(n.attributes,n.position),alert(`Training voltooid! ${n.name} heeft +1 ${i.stat} gekregen.`)),t.trainerId&&(o.training.trainerStatus[t.trainerId]={busy:!1,assignedSlot:null}),St(e),ve(),J()}function wi(e){o.training.teamTraining.selected=e;const t={defense:{type:"defense",value:10},setpiece:{type:"setpiece",value:10},attack:{type:"attack",value:10}};o.training.teamTraining.bonus=t[e],kt()}window.openPlayerSelectModal=yi;window.cancelTraining=bi;window.selectTeamTraining=wi;window.hireStaff=ci;window.hireAssistant=ri;window.closeTrainingModal=wt;window.selectTrainingPlayer=fi;function ki(){const e=o.nextMatch.time-Date.now(),t=document.getElementById("timer-hours"),n=document.getElementById("timer-minutes"),i=document.getElementById("timer-seconds");if(t&&n&&i)if(e<=0){t.textContent="00",n.textContent="00",i.textContent="00";const s=document.getElementById("play-match-btn");s&&s.classList.add("match-ready")}else{const s=Math.floor(e/36e5),r=Math.floor(e%(1e3*60*60)/(1e3*60)),l=Math.floor(e%(1e3*60)/1e3);t.textContent=String(s).padStart(2,"0"),n.textContent=String(r).padStart(2,"0"),i.textContent=String(l).padStart(2,"0")}const a=document.getElementById("match-timer");a&&!t&&(a.textContent=e<=0?"Nu spelen!":je(e))}function Si(e){const t=o.players.find(p=>p.id===e);if(!t)return;const n=document.getElementById("player-modal"),i=document.getElementById("player-detail-content"),a=U.good.includes(t.personality)?"good":U.bad.includes(t.personality)?"bad":"",s=ge(t,o.club.division),r=Math.round(s*.5),l=Math.round(s*2.5),c=s;i.innerHTML=`
        <div class="player-detail-header">
            <div class="player-detail-avatar" style="background: ${S[t.position].color}">${Ot(t.name)}</div>
            <div class="player-detail-info">
                <h2>${t.name} ${t.nationality.flag}</h2>
                <div class="player-detail-meta">
                    <span>${t.age} jaar</span>
                    <span>${S[t.position].name}</span>
                    <span>Overall: ${t.overall}</span>
                    <span>Potentieel: ${t.potential}</span>
                </div>
            </div>
        </div>

        <div class="player-detail-personality">
            <h4>Persoonlijkheid</h4>
            <span class="personality-badge ${a}">${t.personality}</span>
        </div>

        <div class="player-detail-stats">
            <div class="stat-box">
                <span class="stat-value">${t.goals}</span>
                <span class="stat-label">Doelpunten</span>
            </div>
            <div class="stat-box">
                <span class="stat-value">${t.assists}</span>
                <span class="stat-label">Assists</span>
            </div>
            <div class="stat-box">
                <span class="stat-value">${t.morale}%</span>
                <span class="stat-label">Moraal</span>
            </div>
            <div class="stat-box">
                <span class="stat-value">${v(t.salary)}</span>
                <span class="stat-label">Salaris/week</span>
            </div>
        </div>

        <div class="player-transfer-section">
            <h4>Zet op Transfermarkt</h4>
            <div class="transfer-price-setting">
                <input type="range" class="transfer-price-slider" id="transfer-list-price"
                       min="${r}" max="${l}" value="${c}" step="100">
                <span class="transfer-price-display" id="transfer-list-price-display">${v(c)}</span>
            </div>
            <div class="transfer-price-info">
                <span>Min: ${v(r)} (0.5x)</span>
                <span>Marktwaarde: ${v(s)}</span>
                <span>Max: ${v(l)} (2.5x)</span>
            </div>
            <button class="btn-list-transfer" data-player-id="${t.id}">
                Zet op Transfermarkt
            </button>
        </div>
    `;const u=document.getElementById("transfer-list-price"),d=document.getElementById("transfer-list-price-display");u&&d&&u.addEventListener("input",()=>{d.textContent=v(parseInt(u.value))});const f=i.querySelector(".btn-list-transfer");f&&f.addEventListener("click",()=>{const p=parseInt(u.value);Ei(e,p)}),n.classList.add("active")}function Ei(e,t){const n=o.players.findIndex(a=>a.id===e);if(n===-1)return;const i=o.players[n];confirm(`Wil je ${i.name} op de transfermarkt zetten voor ${v(t)}?`)&&(o.players.splice(n,1),i.price=t,i.listedByPlayer=!0,o.transferMarket.players.push(i),document.getElementById("player-modal").classList.remove("active"),J(),alert(`${i.name} staat nu op de transfermarkt voor ${v(t)}!`))}function De(e){document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active")),document.querySelector(`.nav-item[data-page="${e}"]`)?.classList.add("active"),document.querySelectorAll(".page").forEach(n=>n.classList.remove("active")),document.getElementById(e)?.classList.add("active");const t=document.querySelector(".main-content");t&&(t.scrollTop=0),window.scrollTo(0,0),e==="squad"&&J(),e==="tactics"&&Rn(),e==="training"&&ve(),e==="stadium"&&gt(),e==="scout"&&te(),e==="transfers"&&K(),e==="finances"&&ra(),e==="sponsors"&&qa(),e==="activities"&&Fa(),e==="staff"&&Pt(),e==="mijnteam"&&Et(),e==="jeugdteam"&&ea()}function Mi(){document.querySelectorAll(".nav-item").forEach(e=>{e.addEventListener("click",t=>{t.target.closest(".nav-submenu")||De(e.dataset.page)})}),document.querySelectorAll(".nav-submenu li").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();const i=e.closest(".nav-item").dataset.page,a=e.dataset.tab;De(i),setTimeout(()=>{$i(i,a)},50)})})}function $i(e,t){let n;if(e==="tactics"){n=".tactics-tab";const i=document.querySelector(`${n}[data-tab="${t}"]`);i&&i.click()}else if(e==="training"){n=".training-tab";const i=document.querySelector(`${n}[data-training-tab="${t}"]`);i&&i.click()}else if(e==="staff"){n=".staff-tab";const i=document.querySelector(`${n}[data-staff-tab="${t}"]`);i&&i.click()}}function Ti(){const e={training:"training",lineup:"tactics",scout:"scout",stadium:"stadium"};document.querySelectorAll(".quick-action").forEach(t=>{t.addEventListener("click",()=>{const n=t.dataset.action,i=e[n];i&&De(i)})})}function Ai(){document.querySelectorAll(".filter-btn").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(t=>t.classList.remove("active")),e.classList.add("active"),J()})})}function Ci(){document.querySelectorAll(".modal-close, .modal-backdrop").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".modal").forEach(t=>t.classList.remove("active"))})})}function Ii(){const e=document.getElementById("execute-training-btn");e&&e.addEventListener("click",executeTraining)}function R(){const e=o.club.budget,t=v(e);document.querySelectorAll(".budget-display, .budget-value").forEach(s=>{s.textContent=t});const n=document.getElementById("header-budget");n&&(n.textContent=t);const i=document.getElementById("global-budget-display"),a=document.getElementById("global-budget-amount");i&&a&&(a.textContent=t,i.classList.remove("low-budget","high-budget"),e<1e3?i.classList.add("low-budget"):e>2e4&&i.classList.add("high-budget"),i.classList.remove("budget-changed"),i.offsetWidth,i.classList.add("budget-changed"))}function Bi(){setInterval(()=>{hi()},1e3),setInterval(ki,1e3)}function Xe(){const e=[],t=o.club.division,n=g(10,20);for(let i=0;i<n;i++){const a=D(t);Math.random()<.2?(a.price=0,a.signingBonus=Math.round(a.salary*52*.3),a.isFreeAgent=!0):(a.price=ge(a,t),a.signingBonus=0,a.isFreeAgent=!1),e.push(a)}o.transferMarket.players=e.sort((i,a)=>a.overall-i.overall),o.transferMarket.lastRefresh=Date.now()}function Qe(e,t=4){const n=Math.max(1,e-t),i=Math.min(99,e+t);return`${n}-${i}`}function Li(e,t){const i=Math.max(t,e-6),a=Math.min(99,e+6);return`${i}-${a}`}function K(){const e=document.getElementById("transfer-list");if(!e)return;const t=document.querySelector(".transfer-filter.active")?.dataset.filter||"all",n=parseInt(document.getElementById("transfer-min-price")?.value)||0,i=parseInt(document.getElementById("transfer-max-price")?.value)||5e4,a=document.getElementById("transfer-free-only")?.checked||!1,s=document.getElementById("transfer-sort")?.value||"overall-desc";let r=[...o.transferMarket.players];t!=="all"&&(r=r.filter(d=>_(d.position)===t)),a?r=r.filter(d=>d.price===0):r=r.filter(d=>d.price>=n&&d.price<=i);const[l,c]=s.split("-");if(r.sort((d,f)=>{let p,m;switch(l){case"overall":p=d.overall,m=f.overall;break;case"potential":p=d.potential||d.overall,m=f.potential||f.overall;break;case"price":p=d.price,m=f.price;break;case"age":p=d.age,m=f.age;break;default:p=d.overall,m=f.overall}return c==="asc"?p-m:m-p}),r.length===0){e.innerHTML='<p class="no-results">Geen spelers gevonden met deze filters.</p>';return}let u="";r.forEach(d=>{const f=S[d.position]||{abbr:"??",color:"#666"};d.photo||he(d.name,d.position);const p=d.position==="keeper",m=d.price===0?"Transfervrij":v(d.price),h=d.signingBonus>0?`+${v(d.signingBonus)}`:"",y=Qe(d.overall,3),x=Li(d.potential||d.overall,d.overall),k=p?[{key:"REF",label:"REF",value:d.attributes.REF||d.attributes.VER,color:"#f9a825"},{key:"BAL",label:"BAL",value:d.attributes.BAL||d.attributes.AAN,color:"#7cb342"},{key:"SNE",label:"SNE",value:d.attributes.SNE,color:"#ff9800"},{key:"FYS",label:"FYS",value:d.attributes.FYS,color:"#9c27b0"}]:[{key:"AAN",label:"AAN",value:d.attributes.AAN,color:"#9c27b0"},{key:"VER",label:"VER",value:d.attributes.VER,color:"#2196f3"},{key:"SNE",label:"SNE",value:d.attributes.SNE,color:"#ff9800"},{key:"FYS",label:"FYS",value:d.attributes.FYS,color:"#9c27b0"}],b=d.condition||85,M=d.energy||75;u+=`
            <div class="player-card transfer-card" data-player-id="${d.id}">
                <div class="pc-left">
                    <div class="pc-age-box">
                        <span class="pc-age-value">${d.age}</span>
                        <span class="pc-age-label">jr</span>
                    </div>
                    <span class="pc-flag-large">${d.nationality.flag}</span>
                </div>
                <div class="pc-info">
                    <div class="pc-name-row">
                        <span class="pc-name">${d.name}</span>
                        <span class="pc-pos" style="background: ${f.color}">${f.abbr}</span>
                    </div>
                    <div class="pc-finance transfer-finance">
                        <span class="pc-price ${d.price===0?"free":""}">${m}</span>
                        ${h?`<span class="pc-bonus">${h}</span>`:""}
                    </div>
                </div>
                <div class="pc-condition-bars">
                    <div class="pc-bar-item">
                        <div class="pc-bar-track">
                            <div class="pc-bar-fill" style="width: ${b}%; background: ${ue(b)}"></div>
                        </div>
                        <span class="pc-bar-label">Conditie</span>
                    </div>
                    <div class="pc-bar-item">
                        <div class="pc-bar-track">
                            <div class="pc-bar-fill" style="width: ${M}%; background: ${ue(M)}"></div>
                        </div>
                        <span class="pc-bar-label">Energie</span>
                    </div>
                </div>
                <div class="pc-stats">
                    ${k.map($=>`
                        <div class="pc-stat">
                            <div class="pc-stat-bar-bg">
                                <div class="pc-stat-bar" style="height: ${$.value}%; background: ${$.color}"></div>
                            </div>
                            <span class="pc-stat-val">${Qe($.value,5)}</span>
                            <span class="pc-stat-lbl">${$.label}</span>
                        </div>
                    `).join("")}
                </div>
                <div class="pc-ratings">
                    <div class="pc-overall" style="background: ${f.color}">
                        <span class="pc-overall-value">${y}</span>
                        <span class="pc-overall-label">ALG</span>
                    </div>
                    <div class="pc-potential" style="background: ${f.color}; opacity: 0.85;">
                        <span class="pc-potential-value">${x}</span>
                        <span class="pc-potential-label">POT</span>
                    </div>
                </div>
                <button class="btn btn-primary btn-sm btn-transfer-buy" data-player-id="${d.id}">
                    Kopen
                </button>
            </div>
        `}),e.innerHTML=u,document.querySelectorAll(".btn-transfer-buy").forEach(d=>{d.addEventListener("click",f=>{f.stopPropagation();const p=parseFloat(d.dataset.playerId);Di(p)})})}function Di(e){const t=o.transferMarket.players.find(a=>a.id===e);if(!t)return;const n=t.price+(t.signingBonus||0);if(n>o.club.budget){alert("Je hebt niet genoeg budget!");return}const i=t.price===0?`gratis (${v(t.signingBonus)} tekengeld)`:v(t.price);confirm(`Wil je ${t.name} contracteren voor ${i}?`)&&(o.club.budget-=n,o.players.push(t),o.transferMarket.players=o.transferMarket.players.filter(a=>a.id!==e),R(),K(),alert(`${t.name} is toegevoegd aan je selectie!`))}function Pi(){o.transferMarket.players.length===0&&Xe(),document.querySelectorAll(".transfer-filter").forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll(".transfer-filter").forEach(s=>s.classList.remove("active")),a.classList.add("active"),K()})});const e=document.getElementById("transfer-min-price"),t=document.getElementById("transfer-max-price"),n=document.getElementById("transfer-free-only");e&&e.addEventListener("change",()=>{const a=parseInt(t?.value)||5e4;parseInt(e.value)>a&&(e.value=a),K()}),t&&t.addEventListener("change",()=>{const a=parseInt(e?.value)||0;parseInt(t.value)<a&&(t.value=a),K()}),n&&n.addEventListener("change",()=>{e&&(e.disabled=n.checked),t&&(t.disabled=n.checked),K()});const i=document.getElementById("transfer-sort");i&&i.addEventListener("change",K),document.getElementById("refresh-market-btn")?.addEventListener("click",()=>{Xe(),K()})}function Ri(){let e=100;const t=document.getElementById("scout-position")?.value||"all",n=parseInt(document.getElementById("scout-min-age")?.value)||16,i=parseInt(document.getElementById("scout-max-age")?.value)||35,a=parseInt(document.getElementById("scout-min-potential")?.value)||0,s=parseInt(document.getElementById("scout-min-aan")?.value)||0,r=parseInt(document.getElementById("scout-min-ver")?.value)||0,l=parseInt(document.getElementById("scout-min-tec")?.value)||0,c=parseInt(document.getElementById("scout-min-sne")?.value)||0,u=parseInt(document.getElementById("scout-min-fys")?.value)||0;t!=="all"&&(e-=10),n<20?e-=20:n<23?e-=10:n>=28&&(e+=5),n>=30&&(e+=5);const d=i-n;return d<5&&(e-=(5-d)*5),a>0&&(e-=Math.floor(a/10)*8),e-=Math.floor(s/10)*5,e-=Math.floor(r/10)*5,e-=Math.floor(l/10)*5,e-=Math.floor(c/10)*5,e-=Math.floor(u/10)*5,Math.max(5,Math.min(100,e))}function ne(){const e=Ri(),t=document.getElementById("success-meter-fill"),n=document.getElementById("success-percentage"),i=document.getElementById("success-hint");t&&(t.style.width=`${e}%`),n&&(n.textContent=`${e}%`),i&&(e>=80?(i.textContent="Hoge kans om een speler te vinden!",t.style.background="#4caf50"):e>=50?(i.textContent="Redelijke kans, kan even duren...",t.style.background="#ff9800"):(i.textContent="Lage kans - overweeg bredere criteria",t.style.background="#f44336"))}const X={youngTalent:"Jonge talenten (onder 20) zijn extreem zeldzaam! Elke club jaagt op deze pareltjes. Het voordeel: als je ze vindt, ken ik hun exacte potentieel - geen gokwerk zoals op de transfermarkt.",youngPlayers:"Spelers van 20-23 zijn populair. Moeilijker te vinden, maar ik kan je precies vertellen wat hun plafond is. Op de transfermarkt zie je alleen schattingen!",experienced:"Ervaren spelers (28+) vind ik makkelijk. Minder potentieel, maar wel zekerheid. Hun stats zijn wat je krijgt - geen verrassingen.",highPotential:"Hoog potentieel als eis? Lastig! Maar als ik ze vind, weet je precies wat je koopt. De transfermarkt toont alleen vage ranges.",specific:"Specifieke eisen maken het zoeken lastiger. Maar elk speler die ik vind is grondig geanalyseerd - je ziet exacte waardes, niet geschatte ranges.",general:"Met scouting krijg je zekerheid! Op de transfermarkt zie je geschatte ranges (bijv. 45-52). Ik geef je de echte cijfers. Dat is mijn toegevoegde waarde."};function ce(){const e=document.getElementById("scout-advice");if(!e)return;const t=parseInt(document.getElementById("scout-min-age")?.value)||16,n=parseInt(document.getElementById("scout-min-potential")?.value)||0,i=document.getElementById("scout-position")?.value||"all";let a="";t<20?a=X.youngTalent:t<23?a=X.youngPlayers:t>=28?a=X.experienced:n>60?a=X.highPotential:i!=="all"?a=X.specific:a=X.general,e.innerHTML=`<p>${a}</p>`}function Ni(){const e=document.getElementById("scout-min-age"),t=document.getElementById("scout-max-age"),n=document.getElementById("age-range-display"),i=document.getElementById("scout-age-hint"),a=()=>{const l=parseInt(e?.value)||16,c=parseInt(t?.value)||35;n&&(n.textContent=`${l} - ${c}`),i&&(l<20?(i.textContent="⚠️ Jonge talenten zijn moeilijk te vinden!",i.style.color="#f44336"):l<23?(i.textContent="Jonge spelers zijn lastiger te vinden",i.style.color="#ff9800"):l>=28?(i.textContent="✓ Ervaren spelers zijn makkelijker te vinden",i.style.color="#4caf50"):(i.textContent="Standaard leeftijdsrange",i.style.color="var(--text-muted)")),ne(),ce()};e?.addEventListener("input",a),t?.addEventListener("input",a);const s=document.getElementById("scout-min-potential"),r=document.getElementById("potential-display");s?.addEventListener("input",()=>{r&&(r.textContent=s.value),ne(),ce()}),document.getElementById("scout-position")?.addEventListener("change",()=>{ne(),ce()}),["aan","ver","tec","sne","fys"].forEach(l=>{const c=document.getElementById(`scout-min-${l}`),u=document.getElementById(`scout-min-${l}-val`);c?.addEventListener("input",()=>{u&&(u.textContent=c.value),ne()})}),a(),ne(),ce()}function ji(){document.getElementById("tactic-keeper-pressure")?.addEventListener("change",n=>{o.advancedTactics.keeperPressure=n.target.checked}),document.getElementById("tactic-set-pieces")?.addEventListener("change",n=>{o.advancedTactics.forceSetPieces=n.target.checked}),document.querySelectorAll(".choice-btn, .choice-btn-sm").forEach(n=>{n.addEventListener("click",()=>{const i=n.dataset.choice;(n.closest(".tactic-choice-group")||n.closest(".choice-btns")).querySelectorAll(".choice-btn, .choice-btn-sm").forEach(s=>s.classList.remove("active")),n.classList.add("active"),i.startsWith("fullback-")?o.advancedTactics.fullbackRuns=i.replace("fullback-",""):i.startsWith("marking-")&&(o.advancedTactics.marking=i.replace("marking-",""),Vi())})});const e=document.getElementById("tactic-attack-defense"),t=document.getElementById("tactic-intensity");e?.addEventListener("input",n=>{o.advancedTactics.attackDefense=parseInt(n.target.value),Me()}),t?.addEventListener("input",n=>{o.advancedTactics.duelIntensity=parseInt(n.target.value),Me()}),Me()}function Vi(){const e=document.getElementById("marking-explanation");e&&(o.advancedTactics.marking==="zone"?e.innerHTML="<p>Zone: Spelers dekken gebieden. Beter tegen teams met veel balbezit.</p>":e.innerHTML="<p>Man: Spelers volgen tegenstanders. Beter tegen individuele kwaliteit.</p>")}function Me(){const e=document.getElementById("attack-defense-value"),t=document.getElementById("intensity-value");if(e){const n=o.advancedTactics.attackDefense;n<25?e.textContent="Zeer Verdedigend":n<40?e.textContent="Verdedigend":n<60?e.textContent="Gebalanceerd":n<75?e.textContent="Aanvallend":e.textContent="Zeer Aanvallend"}if(t){const n=o.advancedTactics.duelIntensity;n<25?t.textContent="Voorzichtig":n<40?t.textContent="Rustig":n<60?t.textContent="Normaal":n<75?t.textContent="Intens":t.textContent="Agressief"}}function qi(){const e=document.querySelectorAll(".tactics-tab"),t=document.querySelectorAll(".tactics-panel");e.forEach(n=>{n.addEventListener("click",()=>{const i=n.dataset.tab;e.forEach(a=>a.classList.remove("active")),n.classList.add("active"),t.forEach(a=>{a.classList.remove("active"),a.id===`${i}-panel`&&a.classList.add("active")}),i==="opstelling"&&(se(),oe(),re()),i==="specialisten"&&initSpecialists()})})}function ze(){const e=document.getElementById("lineup-pitch"),t=document.getElementById("lineup-bench"),n=document.getElementById("lineup-formation-name");if(!e||!t)return;const i=o.formation,a=H[i];if(!a)return;n&&(n.textContent=i);let s=`
        <div class="lineup-field-bg">
            <div class="pitch-markings">
                <div class="center-circle"></div>
                <div class="center-line"></div>
                <div class="penalty-area top"></div>
                <div class="penalty-area bottom"></div>
                <div class="goal-area top"></div>
                <div class="goal-area bottom"></div>
            </div>
            <div class="lineup-positions">
    `;a.positions.forEach((d,f)=>{const p=o.lineup[f],m=S[d.role]||{abbr:"??",color:"#666"};s+=`
            <div class="lineup-slot"
                 data-index="${f}"
                 data-role="${d.role}"
                 style="left: ${d.x}%; top: ${d.y}%;"
                 onclick="openLineupDropdown(event, ${f}, '${d.role}')"
                 ondragover="handleDragOver(event)"
                 ondrop="handleDrop(event)">
                ${p?`
                    <div class="lineup-player-filled" style="background: ${m.color}">
                        <span class="lp-overall">${p.overall}</span>
                        <span class="lp-name">${p.name.split(" ")[0]}</span>
                        <button class="lp-remove" onclick="event.stopPropagation(); removeFromLineup(${f})">×</button>
                    </div>
                `:`
                    <div class="lineup-slot-empty" style="border-color: ${m.color}">
                        <span>${m.abbr}</span>
                        <span class="slot-hint">Klik om te kiezen</span>
                    </div>
                `}
            </div>
        `}),s+="</div></div>",e.innerHTML=s;const r={attacker:{label:"AAN",players:[]},midfielder:{label:"MID",players:[]},defender:{label:"DEF",players:[]},goalkeeper:{label:"KEE",players:[]}},l=Object.values(o.lineup).filter(d=>d).map(d=>d.id);o.players.filter(d=>!l.includes(d.id)).forEach(d=>{const f=S[d.position];f&&r[f.group]&&r[f.group].players.push(d)});let u="";Object.entries(r).forEach(([d,f])=>{u+=`
            <div class="sidebar-group ${f.players.length===0?"empty":""}">
                <div class="sidebar-group-header">${f.label}</div>
                <div class="sidebar-players">
                    ${f.players.map(p=>{const m=S[p.position];return`
                            <div class="sidebar-player"
                                 draggable="true"
                                 data-player-id="${p.id}"
                                 ondragstart="handleDragStart(event)"
                                 ondragend="handleDragEnd(event)">
                                <span class="sp-overall" style="background: ${m?.color||"#666"}">${p.overall}</span>
                                <span class="sp-name">${p.name.split(" ")[0]}</span>
                            </div>
                        `}).join("")||'<span class="no-players">-</span>'}
                </div>
            </div>
        `}),t.innerHTML=u}let Pe=null;function _i(e){Pe=e.target.dataset.playerId,e.target.classList.add("dragging"),e.dataTransfer.effectAllowed="move"}function Oi(e){e.preventDefault(),e.dataTransfer.dropEffect="move",(e.target.closest(".lineup-slot")||e.currentTarget).classList.add("drag-over")}function Fi(e){e.target.classList.remove("dragging"),document.querySelectorAll(".lineup-slot").forEach(t=>t.classList.remove("drag-over"))}function Hi(e){e.preventDefault();const t=e.target.closest(".lineup-slot")||e.currentTarget;t.classList.remove("drag-over");const n=parseInt(t.dataset.index),i=o.players.find(a=>a.id===parseFloat(Pe));i&&!isNaN(n)&&(Object.keys(o.lineup).forEach(a=>{o.lineup[a]?.id===i.id&&(o.lineup[a]=null)}),o.lineup[n]=i,ze(),ye()),Pe=null}function zi(e){o.lineup[e]=null,ze(),ye()}function Gi(e,t,n){e.stopPropagation(),Re();const i=e.currentTarget,a=S[n]||{abbr:"??",group:"midfielder"},s=Object.values(o.lineup).filter(f=>f).map(f=>f.id),r=o.players.filter(f=>!s.includes(f.id)),l=r.filter(f=>f.position===n),c=r.filter(f=>{const p=S[f.position];return p&&p.group===a.group&&f.position!==n});l.sort((f,p)=>p.overall-f.overall),c.sort((f,p)=>p.overall-f.overall);const u=document.createElement("div");u.className="lineup-dropdown",u.id="lineup-dropdown-active";let d=`<div class="dropdown-header">${a.abbr} - Kies speler</div>`;l.length>0&&(d+='<div class="dropdown-section-label">Beste keuze</div>',l.forEach(f=>{const p=S[f.position];d+=`
                <div class="dropdown-player" onclick="selectLineupPlayer(${t}, ${f.id})">
                    <span class="dp-overall" style="background: ${p?.color||"#666"}">${f.overall}</span>
                    <span class="dp-name">${f.name}</span>
                    <span class="dp-pos">${p?.abbr||"??"}</span>
                </div>
            `})),c.length>0&&(d+='<div class="dropdown-section-label">Alternatieven</div>',c.slice(0,5).forEach(f=>{const p=S[f.position];d+=`
                <div class="dropdown-player alt" onclick="selectLineupPlayer(${t}, ${f.id})">
                    <span class="dp-overall" style="background: ${p?.color||"#666"}">${f.overall}</span>
                    <span class="dp-name">${f.name}</span>
                    <span class="dp-pos">${p?.abbr||"??"}</span>
                </div>
            `})),l.length===0&&c.length===0&&(d+='<div class="dropdown-empty">Geen spelers beschikbaar</div>'),u.innerHTML=d,i.appendChild(u),setTimeout(()=>{document.addEventListener("click",Re,{once:!0})},10)}function Re(){const e=document.getElementById("lineup-dropdown-active");e&&e.remove()}function Yi(e,t){const n=o.players.find(i=>i.id===t);n&&(Object.keys(o.lineup).forEach(i=>{o.lineup[i]?.id===n.id&&(o.lineup[i]=null)}),o.lineup[e]=n,Re(),ze(),ye())}window.handleDragStart=_i;window.handleDragOver=Oi;window.handleDragEnd=Fi;window.handleDrop=Hi;window.removeFromLineup=zi;window.openLineupDropdown=Gi;window.selectLineupPlayer=Yi;function Ki(){document.documentElement.style.setProperty("--primary-green",o.club.colors.primary),document.documentElement.style.setProperty("--cream",o.club.colors.secondary),document.documentElement.style.setProperty("--orange",o.club.colors.accent);const e=document.getElementById("badge-path"),t=document.getElementById("badge-text-1"),n=document.getElementById("badge-text-2");e&&(e.setAttribute("fill",o.club.colors.primary),e.setAttribute("stroke",o.club.colors.secondary)),t&&t.setAttribute("fill",o.club.colors.secondary),n&&n.setAttribute("fill",o.club.colors.accent)}function Wi(){const e=document.getElementById("club-name-display");e&&(e.textContent=o.club.name)}function Et(){const e=document.getElementById("team-name-input"),t=document.getElementById("team-primary-color"),n=document.getElementById("team-secondary-color"),i=document.getElementById("team-accent-color"),a=document.getElementById("save-team-btn"),s=document.getElementById("settings-notice"),r=document.getElementById("settings-locked");e&&(e.value=o.club.name),t&&(t.value=o.club.colors.primary),n&&(n.value=o.club.colors.secondary),i&&(i.value=o.club.colors.accent);const l=o.club.settingsChangedThisSeason;s&&(s.style.display=l?"none":"flex"),r&&(r.style.display=l?"flex":"none"),e&&(e.disabled=l),t&&(t.disabled=l),n&&(n.disabled=l),i&&(i.disabled=l),a&&(a.disabled=l),Mt(),$t(),Ui(),It(),Xi(),Ji(),Qi()}function Mt(){const e=document.getElementById("badge-preview-svg");if(!e)return;const t=document.getElementById("team-primary-color")?.value||o.club.colors.primary,n=document.getElementById("team-secondary-color")?.value||o.club.colors.secondary,i=document.getElementById("team-accent-color")?.value||o.club.colors.accent;e.innerHTML=`
        <!-- Shield background -->
        <path d="M50 5 L95 25 L95 70 Q95 100 50 115 Q5 100 5 70 L5 25 Z" fill="${t}" stroke="${n}" stroke-width="3"/>

        <!-- Inner shield decoration -->
        <path d="M50 12 L88 28 L88 68 Q88 93 50 107 Q12 93 12 68 L12 28 Z" fill="none" stroke="${n}" stroke-width="1" opacity="0.3"/>

        <!-- Goal net symbol -->
        <g transform="translate(35, 25)">
            <!-- Goal posts -->
            <rect x="0" y="8" width="3" height="22" fill="${n}"/>
            <rect x="27" y="8" width="3" height="22" fill="${n}"/>
            <rect x="0" y="5" width="30" height="4" fill="${n}"/>
            <!-- Net lines -->
            <line x1="4" y1="9" x2="4" y2="30" stroke="${n}" stroke-width="0.5" opacity="0.6"/>
            <line x1="10" y1="9" x2="10" y2="30" stroke="${n}" stroke-width="0.5" opacity="0.6"/>
            <line x1="15" y1="9" x2="15" y2="30" stroke="${n}" stroke-width="0.5" opacity="0.6"/>
            <line x1="20" y1="9" x2="20" y2="30" stroke="${n}" stroke-width="0.5" opacity="0.6"/>
            <line x1="26" y1="9" x2="26" y2="30" stroke="${n}" stroke-width="0.5" opacity="0.6"/>
            <line x1="3" y1="15" x2="27" y2="15" stroke="${n}" stroke-width="0.5" opacity="0.6"/>
            <line x1="3" y1="22" x2="27" y2="22" stroke="${n}" stroke-width="0.5" opacity="0.6"/>
            <!-- Ball going in -->
            <circle cx="15" cy="20" r="6" fill="${i}" stroke="${n}" stroke-width="1"/>
            <path d="M12 17 L18 23 M18 17 L12 23" stroke="${n}" stroke-width="0.8" opacity="0.7"/>
        </g>

        <!-- FC text -->
        <text x="50" y="70" text-anchor="middle" fill="${n}" font-family="Bebas Neue, sans-serif" font-size="11" letter-spacing="2">FC</text>

        <!-- GOALS text -->
        <text x="50" y="85" text-anchor="middle" fill="${i}" font-family="Bebas Neue, sans-serif" font-size="16" font-weight="bold" letter-spacing="1">GOALS</text>

        <!-- MAKEN text -->
        <text x="50" y="100" text-anchor="middle" fill="${n}" font-family="Bebas Neue, sans-serif" font-size="12" letter-spacing="2">MAKEN</text>
    `}function $t(){const e=document.querySelector(".kit-svg");if(!e)return;const t=document.getElementById("team-primary-color")?.value||o.club.colors.primary,n=document.getElementById("team-secondary-color")?.value||o.club.colors.secondary,i=document.getElementById("team-accent-color")?.value||o.club.colors.accent;e.style.setProperty("--kit-primary",t),e.style.setProperty("--kit-secondary",n),e.style.setProperty("--kit-accent",i)}function Ui(){const e=["Eredivisie","Eerste Divisie","Tweede Divisie","1e Klasse","2e Klasse","3e Klasse","4e Klasse","5e Klasse","6e Klasse"];document.getElementById("club-founded").textContent=`Seizoen ${o.club.stats?.founded||1}`,document.getElementById("club-titles").textContent=o.club.stats?.titles||0,document.getElementById("club-highest-div").textContent=e[o.club.stats?.highestDivision||8]||"6e Klasse",document.getElementById("club-total-goals").textContent=o.club.stats?.totalGoals||0,document.getElementById("club-total-matches").textContent=o.club.stats?.totalMatches||0,document.getElementById("club-reputation").textContent=o.club.reputation||10}function Ji(){const e=document.getElementById("team-primary-color"),t=document.getElementById("team-secondary-color"),n=document.getElementById("team-accent-color"),i=document.getElementById("save-team-btn");[e,t,n].forEach(a=>{a&&(a.removeEventListener("input",et),a.addEventListener("input",et))}),i&&(i.removeEventListener("click",tt),i.addEventListener("click",tt))}function et(){Mt(),$t()}function tt(){if(o.club.settingsChangedThisSeason){alert("Je hebt je club dit seizoen al aangepast. Wacht tot volgend seizoen.");return}const e=document.getElementById("team-name-input"),t=document.getElementById("team-primary-color"),n=document.getElementById("team-secondary-color"),i=document.getElementById("team-accent-color");if(!e?.value.trim()){alert("Voer een geldige clubnaam in.");return}o.club.name=e.value.trim(),o.club.colors.primary=t?.value||o.club.colors.primary,o.club.colors.secondary=n?.value||o.club.colors.secondary,o.club.colors.accent=i?.value||o.club.colors.accent,o.club.settingsChangedThisSeason=!0,Ki(),Wi(),Zi(),Et(),alert("Club instellingen opgeslagen! Dit kan pas volgend seizoen weer gewijzigd worden.")}function Zi(){const e=document.getElementById("club-badge-svg");if(!e)return;const{primary:t,secondary:n,accent:i}=o.club.colors,a=e.querySelector("#badge-path"),s=e.querySelector("#badge-text-fc"),r=e.querySelector("#badge-text-1"),l=e.querySelector("#badge-text-2");a&&(a.setAttribute("fill",t),a.setAttribute("stroke",n)),s&&s.setAttribute("fill",n),r&&r.setAttribute("fill",i),l&&l.setAttribute("fill",n),e.querySelectorAll('[fill="var(--cream)"]').forEach(c=>{c.setAttribute("fill",n)}),e.querySelectorAll('[stroke="var(--cream)"]').forEach(c=>{c.setAttribute("stroke",n)})}function Xi(){const e=document.getElementById("achievements-progress"),t=document.getElementById("achievements-grid");if(!e||!t)return;const n=Be(o),i=ut(o);e.innerHTML=`
        <span class="progress-text">${n.unlocked} / ${n.total} behaald</span>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${n.progress}%"></div>
        </div>
    `;let a="";i.forEach(s=>{const r=s.hidden&&!s.unlocked,l=r?"Verborgen":s.name,c=r?"???":s.description;a+=`
            <div class="achievement-item ${s.unlocked?"unlocked":""} ${s.hidden?"hidden-achievement":""}">
                <div class="achievement-icon">${r?"❓":s.icon}</div>
                <div class="achievement-info">
                    <span class="achievement-name">${l}</span>
                    <span class="achievement-desc">${c}</span>
                </div>
                ${s.unlocked?'<span class="achievement-check">✓</span>':""}
            </div>
        `}),t.innerHTML=a}function Qi(){const e=document.getElementById("toggle-achievements"),t=document.getElementById("achievements-grid");!e||!t||e.addEventListener("click",()=>{const n=t.style.display==="none";t.style.display=n?"grid":"none",e.textContent=n?"Verberg":"Toon Alle"})}let pe="12-13";function ea(){o.youthPlayers.length===0&&ta(),Tt(),Ge(pe),aa()}function ta(){[{min:12,max:13,count:g(3,5)},{min:14,max:15,count:g(3,5)},{min:16,max:17,count:g(2,4)}].forEach(t=>{for(let n=0;n<t.count;n++){const i=na(t.min,t.max);o.youthPlayers.push(i)}})}function na(e,t){const n=g(e,t),i=Q[Math.random()<.7?0:g(0,Q.length-1)],a=$e[g(0,$e.length-1)],s=Te[g(0,Te.length-1)],r=Object.keys(S).filter(b=>!(n<14&&b==="keeper")),l=r[g(0,r.length-1)],c=15,u=40,d=g(50,85),f=Math.random()<.15?g(10,20):0,p=Math.min(99,d+f),m=.3+(n-12)*.08,h={AAN:Math.round(g(c,u)*m),VER:Math.round(g(c,u)*m),SNE:Math.round(g(c,u)*m),FYS:Math.round(g(c,u)*m)};l==="keeper"&&(h.REF=Math.round(g(c,u)*m),h.BAL=Math.round(g(c,u)*m));const y=S[l].weights;let x=0;Object.keys(y).forEach(b=>{x+=(h[b]||0)*y[b]}),x=Math.round(x);const k=p>=75;return{id:Date.now()+Math.random(),name:`${a} ${s}`,age:n,nationality:i,position:l,attributes:h,overall:x,potential:p,isSupertalent:k,growthRate:g(2,5),yearsInAcademy:g(1,3)}}function Tt(){const e=o.youthPlayers.length,t=o.youthPlayers.filter(n=>n.isSupertalent).length;document.getElementById("youth-count").textContent=e,document.getElementById("youth-talents").textContent=t}function Ge(e){const t=document.getElementById("youth-players-grid"),n=document.getElementById("youth-empty-state");if(!t)return;const[i,a]=e.split("-").map(Number),s=o.youthPlayers.filter(r=>r.age>=i&&r.age<=a);if(s.length===0){t.innerHTML="",n&&(n.style.display="block");return}n&&(n.style.display="none"),s.sort((r,l)=>l.potential-r.potential),t.innerHTML=s.map(r=>ia(r)).join(""),t.querySelectorAll(".btn-sign-contract").forEach(r=>{r.addEventListener("click",()=>{const l=parseFloat(r.dataset.playerId);sa(l)})})}function ia(e){const t=S[e.position]||{abbr:"??",color:"#666"},n=e.age>=16,i=e.potential;return`
        <div class="player-card youth-card ${e.isSupertalent?"supertalent":""}" data-player-id="${e.id}">
            <div class="pc-left">
                <div class="pc-age-box">
                    <span class="pc-age-value">${e.age}</span>
                    <span class="pc-age-label">jr</span>
                </div>
                <span class="pc-flag-large">${e.nationality.flag}</span>
            </div>
            <div class="pc-info">
                <div class="pc-name-row">
                    <span class="pc-name">${e.name}</span>
                    <span class="pc-pos" style="background: ${t.color}">${t.abbr}</span>
                    ${e.isSupertalent?'<span class="pc-talent">⭐</span>':""}
                </div>
                <div class="pc-finance">
                    <span class="pc-growth">Groei: +${e.growthRate}/sz</span>
                </div>
            </div>
            <div class="pc-ratings">
                <div class="pc-overall" style="background: ${t.color}">
                    <span class="pc-overall-value">${e.overall||"?"}</span>
                    <span class="pc-overall-label">ALG</span>
                </div>
                <div class="pc-potential" style="background: ${t.color}; opacity: 0.85;">
                    <span class="pc-potential-value">${i}</span>
                    <span class="pc-potential-label">POT</span>
                </div>
            </div>
            <div class="pc-action">
                <button class="btn ${n?"btn-primary":"btn-secondary"} btn-sign-contract btn-sm"
                        data-player-id="${e.id}"
                        ${n?"":"disabled"}>
                    ${n?"✍️ Contract":"🔒 16+"}
                </button>
            </div>
        </div>
    `}function aa(){document.querySelectorAll(".youth-tab").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".youth-tab").forEach(t=>t.classList.remove("active")),e.classList.add("active"),pe=e.dataset.age,Ge(pe)})})}function sa(e){const t=o.youthPlayers.findIndex(h=>h.id===e);if(t===-1)return;const n=o.youthPlayers[t];if(n.age<16){alert("Spelers moeten minimaal 16 jaar oud zijn om een profcontract te tekenen.");return}const i=o.club.division,a=ee(i),s=a?a.salary.avg:50,r=(n.potential-50)*2,l=Math.max(a?.salary.min||25,Math.round(s*.5+r)),c=[...U.good,...U.neutral,...U.bad],u=c[g(0,c.length-1)],d=Object.entries(n.attributes).filter(([h])=>h!=="REF"&&h!=="BAL").sort((h,y)=>y[1]-h[1])[0],p=it[n.position]?.[d?.[0]]?.name||"Jeugdproduct",m={id:Date.now()+Math.random(),name:n.name,age:n.age,nationality:n.nationality,position:n.position,attributes:{...n.attributes},overall:n.overall,potential:n.potential,salary:l,personality:u,tag:p,condition:100,energy:100,form:70,morale:80,injuryDaysLeft:0,contractYears:3,isYouthProduct:!0};o.players.push(m),o.youthPlayers.splice(t,1),Tt(),Ge(pe),alert(`${n.name} heeft een profcontract getekend en is toegevoegd aan de A-selectie!`)}function oa(){const t=o.sponsor?.weeklyPay||0,n=Math.round(t/7),i=z.sponsoring.find(k=>k.id===o.stadium.sponsoring)?.dailyIncome||0,a=o.stadium.fanshop.reduce((k,b)=>{const M=z.fanshop.find($=>$.id===b);return k+(M?.dailyIncome||0)},0),r=G?.kantine?.levels.find(k=>k.id===o.stadium.kantine)?.effect?.match(/€(\d+)/),l=r?parseInt(r[1]):50,c=Math.round(l/7),u=o.players.reduce((k,b)=>k+(b.salary||0),0),d=Math.round(u/7);let f=0;o.staff?.fysio&&(f+=100),o.staff?.scout&&(f+=150),o.staff?.dokter&&(f+=200),Object.values(o.assistantTrainers||{}).forEach(k=>{k&&(f+=75)});const p=Math.round(f/7),m=Math.round((z.tribunes.find(k=>k.id===o.stadium.tribune)?.maintenance||0)/7),h=n+i+a+c,y=d+p+m,x=h-y;return{income:{sponsor:n,sponsoringBonus:i,merch:a,kantine:c},expense:{playerSalary:d,staffSalary:p,maintenance:m},totalIncome:h,totalExpense:y,dailyBalance:x,tomorrowBalance:o.club.budget+x,weeklyPlayerSalary:u,weeklyStaffSalary:f,weeklySponsor:t}}function ra(){const e=oa(),t=document.getElementById("current-balance");t&&(t.textContent=v(o.club.budget));const n=document.getElementById("tomorrow-balance");n&&(n.textContent=v(e.tomorrowBalance));const i=document.getElementById("total-income");i&&(i.textContent=`+${v(e.totalIncome)}`);const a=document.getElementById("income-breakdown");a&&(a.innerHTML=`
            <li><span>Shirtsponsor</span><span>+${v(e.income.sponsor)}</span></li>
            <li><span>Sponsoring Niveau</span><span>+${v(e.income.sponsoringBonus)}</span></li>
            <li><span>Merchandise</span><span>+${v(e.income.merch)}</span></li>
            <li><span>Kantine</span><span>+${v(e.income.kantine)}</span></li>
        `);const s=document.getElementById("total-expense");s&&(s.textContent=`-${v(e.totalExpense)}`);const r=document.getElementById("expense-breakdown");r&&(r.innerHTML=`
            <li><span>Spelerssalarissen</span><span>-${v(e.expense.playerSalary)}</span></li>
            <li><span>Stafsalarissen</span><span>-${v(e.expense.staffSalary)}</span></li>
            <li><span>Onderhoud</span><span>-${v(e.expense.maintenance)}</span></li>
        `);const l=document.getElementById("total-profit");if(l){const C=e.dailyBalance>=0?"profit":"loss";l.textContent=(e.dailyBalance>=0?"+":"")+v(e.dailyBalance),l.className=`finance-total ${C}`}const c=document.getElementById("daily-profit"),u=document.getElementById("weekly-profit"),d=document.getElementById("monthly-profit");if(c&&(c.textContent=(e.dailyBalance>=0?"+":"")+v(e.dailyBalance),c.className=`period-value ${e.dailyBalance>=0?"positive":"negative"}`),u){const C=e.dailyBalance*7;u.textContent=(C>=0?"+":"")+v(C),u.className=`period-value ${C>=0?"positive":"negative"}`}if(d){const C=e.dailyBalance*30;d.textContent=(C>=0?"+":"")+v(C),d.className=`period-value ${C>=0?"positive":"negative"}`}const f=document.getElementById("current-balance-bottom");f&&(f.textContent=v(o.club.budget));const p=document.getElementById("balance-change");if(p){const C=(e.dailyBalance>=0?"+":"")+v(e.dailyBalance)+" vandaag";p.textContent=C,p.className=`balance-change ${e.dailyBalance>=0?"positive":"negative"}`}const m=34-o.week,h=e.dailyBalance*7,y=e.totalIncome*7*m,x=e.totalExpense*7*m,k=o.club.budget+h*m,b=document.getElementById("season-end-estimate");b&&(b.textContent=v(Math.round(k)));const M=document.getElementById("season-income");M&&(M.textContent="+"+v(Math.round(y)));const $=document.getElementById("season-expense");$&&($.textContent="-"+v(Math.round(x)));const A=document.querySelector(".prediction-subtitle");A&&(A.textContent=`Over ${m} weken`)}const ie={lineup:["Heb je je opstelling al bekeken? Zorg dat spelers op hun beste positie staan!","Een goede opstelling is het halve werk. Check of iedereen op z'n plek staat.","Sommige spelers presteren beter op bepaalde posities. Experimenteer gerust!"],training:["Jonge spelers hebben veel potentieel. Laat ze regelmatig trainen!","Training is de sleutel tot groei. Vergeet niet je talenten te ontwikkelen.","Een getraind team is een winnend team. Stuur je spelers naar de training!"],scout:["Op zoek naar nieuw talent? De scout kan helpen, maar jonge toptalenten zijn schaars.","Scouten op jonge spelers is moeilijker, maar de beloning kan groot zijn!","Ervaren spelers zijn makkelijker te vinden dan jong talent. Kies verstandig!"],stadium:["Upgrade je stadion voor meer inkomsten en thuisvoordeel!","Een groter stadion betekent meer fans en meer geld. Investeer slim!","Vergeet de faciliteiten niet - horeca en fanshop leveren extra inkomsten op."],general:["Welkom! Als voorzitter help ik je met tips om de club te verbeteren.","Elke beslissing telt. Bouw je club stap voor stap op naar de top!","Succes komt niet vanzelf - train, scout en bouw je stadion uit!"]};function la(){const e=[];return Math.random()<.3&&e.push(...ie.lineup),(o.players?.filter(n=>n.age<=23)||[]).length>0&&Math.random()<.3&&e.push(...ie.training),Math.random()<.25&&e.push(...ie.scout),Math.random()<.25&&e.push(...ie.stadium),e.push(...ie.general),e[Math.floor(Math.random()*e.length)]}function nt(){const e=document.getElementById("chairman-tip"),t=document.getElementById("chairman-avatar");if(!e||!t)return;t.classList.add("talking");const n=la();e.style.opacity="0",setTimeout(()=>{e.textContent=n,e.style.opacity="1",setTimeout(()=>{t.classList.remove("talking")},1500)},300)}function ca(){nt(),setInterval(nt,15e3)}function da(){const e=Gt();if(e){st(e),console.log("📂 Save file loaded!");const i=Wt(o);i&&i.hoursAway>=1&&(Ut(o,i),$a(i))}else o.players=Tn(o.club.division),o.standings=rt(o.club.name,o.club.division),o.achievements=dt();o.nextMatch.time=Date.now()-1e3;const t=ct(o);t.claimed&&setTimeout(()=>{Sa(t)},1e3),Oe(),Fe(),J(),R(),be(),Mi(),Ti(),Ai(),Ci(),ni(),Ii(),Pi(),Ni(),ji(),qi(),ca(),ga(),Na(),Bi(),Kt(o),ft(o)&&setTimeout(La,5e3);const n=qe(o);n.length>0&&setTimeout(()=>{n.forEach((i,a)=>{setTimeout(()=>{Ye(i)},a*1500)})},2e3),console.log("🎮 Zaterdagvoetbal v2.0 initialized!"),console.log("📊 Squad:",o.players.length,"players"),console.log("💰 Budget:",v(o.club.budget)),console.log("🏆 Achievements:",Be(o).unlocked+"/"+Be(o).total)}function be(){const e=Ie(o.manager?.xp||0),t=e.xp,n=t+e.xpToNext,i=Math.round(e.progress*100),a=document.getElementById("trainer-title"),s=document.getElementById("trainer-level"),r=document.getElementById("xp-current"),l=document.getElementById("xp-target"),c=document.getElementById("xp-fill");a&&(a.textContent=e.title),s&&(s.textContent=e.level),r&&(r.textContent=t),l&&(l.textContent=e.xpToNext>0?n:"MAX"),c&&(c.style.width=`${i}%`);const u=document.getElementById("global-manager-title"),d=document.getElementById("global-manager-level");u&&(u.textContent=e.title),d&&(d.textContent=e.level);const f=o.dailyRewards?.streak||0,p=document.getElementById("daily-streak");p&&p.classList.contains("daily-streak-sticker")&&(p.innerHTML=`
            <span class="streak-fire">🔥</span>
            <span class="streak-count">${f}</span>
            <span class="streak-label">dagen</span>
        `);const m=document.getElementById("streak-days");m&&(m.textContent=f);const h=document.querySelector(".streak-display");h&&(h.textContent=f);const y=document.getElementById("btn-claim-daily");if(y){const F=new Date().toDateString(),xe=o.dailyRewards?.lastClaimDate===F,le=f%7+1,Z=[100,200,300,400,500,600,1e3];xe?(y.disabled=!0,y.textContent="✓"):(y.disabled=!1,y.textContent=`€${Z[le-1]}`)}const x=document.getElementById("season-number"),k=document.getElementById("week-number"),b=document.getElementById("newspaper-week"),M=document.getElementById("poster-matchday");x&&(x.textContent=o.season),k&&(k.textContent=o.week),b&&(b.textContent=o.week),M&&(M.textContent=o.week);const $=document.getElementById("home-team-name"),A=document.getElementById("away-team-name");$&&($.textContent=o.club.name),A&&o.nextMatch&&(A.textContent=o.nextMatch.opponent);const C=document.getElementById("stat-wins"),I=document.getElementById("stat-draws"),N=document.getElementById("stat-losses");C&&(C.textContent=o.stats?.wins||0),I&&(I.textContent=o.stats?.draws||0),N&&(N.textContent=o.stats?.losses||0),pa(),ua(),fa(),ma()}function ua(){const e=document.getElementById("dashboard-starplayers");if(!e)return;const t=o.players.sort((n,i)=>i.overall-n.overall).slice(0,3);if(t.length===0){e.innerHTML='<p style="font-size: 0.65rem; color: var(--text-muted); text-align: center; padding: 8px;">Geen spelers</p>';return}e.innerHTML=t.map(n=>{const i=S[n.position]||{color:"#1a5f2a",abbr:"?"};return`
            <div class="sp-item">
                <span class="sp-flag">${n.nationality?.flag||"🇳🇱"}</span>
                <div class="sp-info">
                    <span class="sp-name">${n.name}</span>
                    <span class="sp-age">${n.age} jaar</span>
                </div>
                <span class="sp-pos" style="background: ${i.color}">${i.abbr}</span>
                <span class="sp-overall" style="color: ${i.color}">${n.overall}</span>
            </div>
        `}).join("")}function fa(){const e=document.getElementById("dashboard-toptalents");if(!e)return;const t=(o.youthPlayers||[]).sort((n,i)=>(i.potential||0)-(n.potential||0)).slice(0,3);if(t.length===0){e.innerHTML='<p style="font-size: 0.6rem; color: var(--text-muted); text-align: center; padding: 6px;">Upgrade jeugdacademie</p>';return}e.innerHTML=t.map(n=>{const i=n.potential||50,a=Math.round(i/20*2)/2,s=Math.floor(a),r=a%1!==0;let l="";for(let c=0;c<s;c++)l+="★";r&&(l+="½");for(let c=0;c<5-s-(r?1:0);c++)l+="☆";return`
            <div class="tt-item">
                <span class="tt-flag">${n.nationality?.flag||"🇳🇱"}</span>
                <div class="tt-info">
                    <span class="tt-name">${n.name}</span>
                    <span class="tt-age">${n.age} jaar</span>
                </div>
                <span class="tt-stars">${l}</span>
            </div>
        `}).join("")}function pa(){const e=document.getElementById("top-scorer-photo"),t=document.getElementById("top-scorer-name"),n=document.getElementById("top-scorer-stat");if(!e||!t||!n)return;const i=o.players.filter(a=>a.goals>0).sort((a,s)=>s.goals-a.goals)[0];i?(e.textContent="⚽",t.textContent=i.name,n.textContent=`${i.goals} doelpunten`):(e.textContent="⭐",t.textContent="Nog geen",n.textContent="topscorer")}function ma(){document.querySelectorAll(".sticky-note, .sticky-compact, .kd-action, .da-btn").forEach(t=>{const n=t.cloneNode(!0);t.parentNode.replaceChild(n,t),n.addEventListener("click",()=>{switch(n.dataset.action){case"training":document.querySelector('[data-page="training"]')?.click();break;case"lineup":document.querySelector('[data-page="tactics"]')?.click();break;case"scout":document.querySelector('[data-page="scout"]')?.click();break;case"transfers":document.querySelector('[data-page="transfers"]')?.click();break;case"squad":document.querySelector('[data-page="squad"]')?.click();break;case"stadium":document.querySelector('[data-page="stadium"]')?.click();break}})})}function ha(){const e=ct(o);if(e.alreadyClaimed){E("Je hebt vandaag al geclaimd!","info");return}e.claimed&&(E(`+€${e.reward.amount} ontvangen! ${e.reward.description}`,"success"),R(),be(),O())}window.claimDailyBonus=ha;function ga(){const e=document.getElementById("play-match-btn");e&&e.addEventListener("click",ya)}function ya(){const e=Date.now();if(o.nextMatch.time>e){E("De wedstrijd is nog niet beschikbaar!","warning");return}if(o.lineup.filter(u=>u!==null).length<11){E("Vul eerst je opstelling aan (11 spelers nodig)!","error");return}const n=Qt(o.club.division,o.nextMatch.opponentPosition||g(1,8));n.name=o.nextMatch.opponent||n.name;const i=o.week%2===1,a=nn({name:o.club.name,strength:Ce(o.lineup,o.formation,o.tactics,o.lineup)},n,o.lineup,o.formation,o.tactics,i),s=i?a.homeScore:a.awayScore,r=i?a.awayScore:a.homeScore;sn(o.lineup,a,i),de(o.standings,o.club.name,s,r),de(o.standings,n.name,r,s),ln(o.standings),o.club.stats.totalMatches++,o.club.stats.totalGoals+=s;const l=ot(a.homeScore,a.awayScore,i);if(l==="win"?(o.stats.wins++,o.stats.currentUnbeaten++,o.stats.currentWinStreak=(o.stats.currentWinStreak||0)+1,i&&o.stats.homeWins++):l==="draw"?(o.stats.draws++,o.stats.currentUnbeaten++,o.stats.currentWinStreak=0):(o.stats.losses++,o.stats.currentUnbeaten=0,o.stats.currentWinStreak=0),r===0&&o.stats.cleanSheets++,s>o.stats.highestScoreMatch&&(o.stats.highestScoreMatch=s),new Date().getDay()===6&&o.stats.saturdayMatches++,ae(o,l==="win"?"matchWin":l==="draw"?"matchDraw":"matchLoss"),r===0&&ae(o,"cleanSheet"),ae(o,"goalScored",s*5),o.lastMatch={...a,isHome:i,playerScore:s,opponentScore:r,resultType:l,opponent:n.name},o.week++,cn(o.standings)){const u=ba();Ca(u)}else va();xa(a,i,n.name);const c=qe(o);c.length>0&&setTimeout(()=>{c.forEach((u,d)=>{setTimeout(()=>{Ye(u)},d*1500)})},3e3),Oe(),Fe(),J(),R(),be(),O(o)}function va(){const e=fn(o.standings,o.week);e?o.nextMatch={opponent:e.name,time:We(),isHome:e.isHome,opponentPosition:e.position}:o.nextMatch={opponent:"Onbekende Tegenstander",time:We()}}function ba(){const e=lt(o.standings,o.club.division);return e.promoted&&(o.stats.promotions++,ae(o,"promotion")),e.position===6&&o.stats.relegationEscapes++,e.isChampion&&ae(o,"title"),dn(o),e}function xa(e,t,n){const i=document.getElementById("match-result-modal")||wa(),a=t?e.homeScore:e.awayScore,s=t?e.awayScore:e.homeScore,r=ot(e.homeScore,e.awayScore,t),l=r==="win"?"result-win":r==="loss"?"result-loss":"result-draw",c=r==="win"?"Gewonnen!":r==="loss"?"Verloren":"Gelijkspel",u=i.querySelector(".modal-content")||i;u.innerHTML=`
        <div class="match-result-header ${l}">
            <h2>${c}</h2>
            <div class="match-score">
                <span class="team-name">${o.club.name}</span>
                <span class="score">${a} - ${s}</span>
                <span class="team-name">${n}</span>
            </div>
        </div>
        <div class="match-events">
            <h3>Wedstrijdverloop</h3>
            <div class="events-list">
                ${e.events.slice(0,15).map(d=>`
                    <div class="match-event ${d.type}">
                        <span class="event-minute">${d.minute}'</span>
                        <span class="event-text">${d.commentary||d.type}</span>
                    </div>
                `).join("")}
            </div>
        </div>
        <div class="match-stats">
            <h3>Statistieken</h3>
            <div class="stats-row">
                <span>${e.possession.home}%</span>
                <span>Balbezit</span>
                <span>${e.possession.away}%</span>
            </div>
            <div class="stats-row">
                <span>${e.shots.home}</span>
                <span>Schoten</span>
                <span>${e.shots.away}</span>
            </div>
            <div class="stats-row">
                <span>${e.shotsOnTarget.home}</span>
                <span>Op doel</span>
                <span>${e.shotsOnTarget.away}</span>
            </div>
        </div>
        ${e.manOfTheMatch?`
            <div class="man-of-match">
                <h3>Man of the Match</h3>
                <span class="motm-name">⭐ ${e.manOfTheMatch.name}</span>
            </div>
        `:""}
        <button class="btn btn-primary" onclick="closeMatchResultModal()">Sluiten</button>
    `,i.style.display="flex"}function wa(){const e=document.createElement("div");return e.id="match-result-modal",e.className="modal",e.innerHTML='<div class="modal-content match-result-content"></div>',document.body.appendChild(e),e}function ka(){const e=document.getElementById("match-result-modal");e&&(e.style.display="none")}window.closeMatchResultModal=ka;function Sa(e){const t=document.getElementById("daily-reward-modal")||Ea(),n=t.querySelector(".modal-content")||t,i=Array(7).fill(0).map((a,s)=>{const r=s<e.streakDay;return`<span class="streak-dot ${r?"active":""}">${r?"✓":s+1}</span>`}).join("");n.innerHTML=`
        <div class="daily-reward-header">
            <h2>🎁 Dagelijkse Beloning!</h2>
            <p>${e.reward.description}</p>
        </div>
        <div class="reward-amount">
            <span class="reward-icon">💰</span>
            <span class="reward-value">+${v(e.reward.amount)}</span>
        </div>
        <div class="streak-display">
            <h3>Streak: ${e.streak} dagen</h3>
            <div class="streak-dots">${i}</div>
            ${e.streakDay===7?'<p class="streak-complete">🎉 Week voltooid! Extra bonus!</p>':""}
        </div>
        <button class="btn btn-primary" onclick="closeDailyRewardModal()">Bedankt!</button>
    `,t.style.display="flex"}function Ea(){const e=document.createElement("div");return e.id="daily-reward-modal",e.className="modal",e.innerHTML='<div class="modal-content daily-reward-content"></div>',document.body.appendChild(e),e}function Ma(){const e=document.getElementById("daily-reward-modal");e&&(e.style.display="none")}window.closeDailyRewardModal=Ma;function $a(e){const t=document.getElementById("offline-modal")||Ta(),n=t.querySelector(".modal-content")||t;n.innerHTML=`
        <div class="offline-header">
            <h2>⏰ Welkom Terug!</h2>
            <p>Je was ${e.hoursAway} uur weg. Dit is er gebeurd:</p>
        </div>
        <div class="offline-progress">
            ${e.energyRecovered>0?`
                <div class="progress-item">
                    <span class="progress-icon">⚡</span>
                    <span>Spelers hersteld: +${e.energyRecovered}% energie</span>
                </div>
            `:""}
            ${e.trainingSessions>0?`
                <div class="progress-item">
                    <span class="progress-icon">🏋️</span>
                    <span>${e.trainingSessions} trainingssessie(s) voltooid</span>
                </div>
            `:""}
            ${e.scoutMissionsCompleted>0?`
                <div class="progress-item">
                    <span class="progress-icon">🔭</span>
                    <span>Scout missie voltooid!</span>
                </div>
            `:""}
            ${e.matchesReady?`
                <div class="progress-item">
                    <span class="progress-icon">⚽</span>
                    <span>Wedstrijd staat klaar om gespeeld te worden!</span>
                </div>
            `:""}
        </div>
        <button class="btn btn-primary" onclick="closeOfflineModal()">Verder spelen</button>
    `,t.style.display="flex"}function Ta(){const e=document.createElement("div");return e.id="offline-modal",e.className="modal",e.innerHTML='<div class="modal-content offline-content"></div>',document.body.appendChild(e),e}function Aa(){const e=document.getElementById("offline-modal");e&&(e.style.display="none")}window.closeOfflineModal=Aa;function Ye(e){const t=document.createElement("div");t.className="achievement-toast",t.innerHTML=`
        <span class="achievement-icon">${e.icon}</span>
        <div class="achievement-info">
            <span class="achievement-label">Prestatie ontgrendeld!</span>
            <span class="achievement-name">${e.name}</span>
            ${e.reward?.cash?`<span class="achievement-reward">+${v(e.reward.cash)}</span>`:""}
        </div>
    `,document.body.appendChild(t),setTimeout(()=>t.classList.add("show"),100),setTimeout(()=>{t.classList.remove("show"),setTimeout(()=>t.remove(),500)},4e3)}function Ca(e){const t=document.getElementById("season-end-modal")||Ia(),n=t.querySelector(".modal-content")||t,i=e.promoted?"⬆️ PROMOTIE!":e.relegated?"⬇️ DEGRADATIE":e.isChampion?"🏆 KAMPIOEN!":"Seizoen Afgelopen",a=e.promoted||e.isChampion?"status-good":e.relegated?"status-bad":"status-neutral",s=ee(e.newDivision)?.name||"Onbekend";n.innerHTML=`
        <div class="season-end-header ${a}">
            <h2>${i}</h2>
            <p>Seizoen ${o.season-1} is afgelopen</p>
        </div>
        <div class="season-stats">
            <div class="stat-item">
                <span class="stat-value">${e.position}e</span>
                <span class="stat-label">Eindstand</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${e.points}</span>
                <span class="stat-label">Punten</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${e.won}-${e.drawn}-${e.lost}</span>
                <span class="stat-label">W-G-V</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${e.goalsFor}-${e.goalsAgainst}</span>
                <span class="stat-label">Doelsaldo</span>
            </div>
        </div>
        <div class="new-season-info">
            <h3>Nieuw Seizoen</h3>
            <p>Je speelt volgend seizoen in de <strong>${s}</strong></p>
        </div>
        <button class="btn btn-primary" onclick="closeSeasonEndModal()">Start Nieuw Seizoen</button>
    `,t.style.display="flex"}function Ia(){const e=document.createElement("div");return e.id="season-end-modal",e.className="modal",e.innerHTML='<div class="modal-content season-end-content"></div>',document.body.appendChild(e),e}function Ba(){const e=document.getElementById("season-end-modal");e&&(e.style.display="none"),Oe(),Fe(),J(),R(),be()}window.closeSeasonEndModal=Ba;function La(){if(!ft(o))return;const e=vn(o,1);if(e.length===0)return;const t=e[0];o.activeEvent=t,Da(t)}function Da(e){const t=document.getElementById("event-modal")||Pa(),n=t.querySelector(".modal-content")||t,i=e.choices.map((a,s)=>{const r=a.condition&&!a.condition(o);return`
            <button class="btn ${r?"btn-disabled":"btn-secondary"}"
                    ${r?"disabled":""}
                    onclick="handleEventChoice(${s})">
                ${a.text}
            </button>
        `}).join("");n.innerHTML=`
        <div class="event-header">
            <span class="event-icon">${e.icon}</span>
            <h2>${e.title}</h2>
        </div>
        <div class="event-message">
            <p>${e.message}</p>
        </div>
        <div class="event-choices">
            ${i}
        </div>
    `,t.style.display="flex"}function Pa(){const e=document.createElement("div");return e.id="event-modal",e.className="modal",e.innerHTML='<div class="modal-content event-content"></div>',document.body.appendChild(e),e}function Ra(e){const t=o.activeEvent;if(!t)return;yn(o,t,e),xn(o,t,e),o.activeEvent=null;const n=document.getElementById("event-modal");n&&(n.style.display="none"),E("Keuze gemaakt!","success"),R(),J(),qe(o).forEach((a,s)=>{setTimeout(()=>Ye(a),s*1500)}),O(o)}window.handleEventChoice=Ra;function Na(){const e=document.getElementById("save-game-btn");e&&e.addEventListener("click",()=>{O(o),E("Spel opgeslagen!","success")});const t=document.getElementById("export-save-btn");t&&t.addEventListener("click",()=>{Jt(o),E("Save geëxporteerd!","success")});const n=document.getElementById("import-save-btn");n&&n.addEventListener("click",()=>{const i=document.createElement("input");i.type="file",i.accept=".json",i.onchange=async a=>{const s=a.target.files[0];if(s)try{const r=await Zt(s);st(r),E("Save geïmporteerd! Pagina wordt herladen...","success"),setTimeout(()=>location.reload(),1500)}catch(r){E("Fout bij importeren: "+r.message,"error")}},i.click()})}const ja={stable:{name:"Bakkerij De Ouderwetse",tagline:"Al 40 jaar hetzelfde recept",description:"Betrouwbaar als roggebrood. Geen verrassingen, gewoon elke week je geld.",matchIncome:500,winBonus:0,icon:"🥖"},balanced:{name:"Café Het Gouden Paard",tagline:"Soms is het druk, soms niet",description:"Gezellig kroegje met een gokkast achter. Winnen levert bonusrondes op.",matchIncome:300,winBonus:250,icon:"🍺"},risky:{name:"Casino Jackpot Jansen",tagline:"Alles of niks, net als roulette",description:"Betaalt bijna niks, tenzij je wint. Dan regent het munten.",matchIncome:100,winBonus:600,icon:"🎰"}},Ne={none:{name:"Geen netwerk",description:"Je vindt geen nieuwe jeugdspelers",weeklyCost:0,chancePerWeek:0,potentialRange:[0,0],icon:"❌"},local:{name:"Lokaal netwerk",description:"Scout in je eigen gemeente",weeklyCost:50,chancePerWeek:.15,potentialRange:[25,40],icon:"🏘️"},regional:{name:"Regionaal netwerk",description:"Scout in de hele regio",weeklyCost:150,chancePerWeek:.25,potentialRange:[35,50],icon:"🗺️"},national:{name:"Nationaal netwerk",description:"Scout door heel Nederland",weeklyCost:400,chancePerWeek:.35,potentialRange:[45,65],icon:"🇳🇱"},international:{name:"Internationaal netwerk",description:"Scout over de hele wereld",weeklyCost:800,chancePerWeek:.45,potentialRange:[55,80],icon:"🌍"}};function Va(e){const t=ja[e];if(!t)return;o.sponsor={id:e,name:t.name,matchIncome:t.matchIncome,winBonus:t.winBonus,weeklyPay:t.matchIncome,icon:t.icon},At(),document.querySelectorAll(".sponsor-block").forEach(a=>{a.classList.remove("active")});const n=document.querySelector(`.sponsor-block[data-sponsor="${e}"]`);n&&n.classList.add("active"),document.querySelectorAll(".sponsor-card-compact").forEach(a=>{a.classList.remove("active")});const i=document.querySelector(`.sponsor-card-compact[data-sponsor="${e}"]`);i&&i.classList.add("active"),E(`${t.name} is nu je shirtsponsor!`,"success"),O()}function At(){const e=document.getElementById("kit-display"),t=document.getElementById("current-sponsor-name"),n=document.getElementById("current-sponsor-earnings"),i=document.getElementById("shirt-sponsor-line1"),a=document.getElementById("shirt-sponsor-line2"),s=o.club?.colors?.primary||"#1b5e20",r=o.club?.colors?.secondary||"#f5f0e1";if(e&&(e.style.setProperty("--shirt-primary",s),e.style.setProperty("--shirt-secondary",r)),o.sponsor){const l=o.sponsor.name.split(" ");let c="",u="";const d=Math.ceil(l.length/2);c=l.slice(0,d).join(" "),u=l.slice(d).join(" "),i&&(i.textContent=c.toUpperCase()),a&&(a.textContent=u.toUpperCase()),t&&(t.textContent=o.sponsor.name),n&&(n.textContent=`€${o.sponsor.matchIncome} per wedstrijd`)}else i&&(i.textContent="GEEN"),a&&(a.textContent="SPONSOR"),t&&(t.textContent="Geen sponsor"),n&&(n.textContent="€0 per wedstrijd")}function Ct(){At()}function qa(){if(Ct(),document.querySelectorAll(".sponsor-card-compact").forEach(e=>{e.classList.remove("active")}),o.sponsor?.id){const e=document.querySelector(`.sponsor-card-compact[data-sponsor="${o.sponsor.id}"]`);e&&e.classList.add("active")}}window.selectSponsor=Va;window.updateSponsorShirtDisplay=Ct;function It(){const e=document.getElementById("scouting-network-options"),t=document.getElementById("current-network-name");if(!e)return;const n=Ne[o.scoutingNetwork];t&&n&&(t.textContent=n.name);let i="";for(const[a,s]of Object.entries(Ne)){const r=o.scoutingNetwork===a,l=a==="none"?"Gratis":`€${s.weeklyCost}/w`;i+=`
            <button class="network-chip ${r?"active":""}" onclick="selectScoutingNetwork('${a}')">
                <span class="nc-icon">${s.icon}</span>
                <span class="nc-name">${s.name.replace(" netwerk","")}</span>
                <span class="nc-cost">${l}</span>
            </button>
        `}e.innerHTML=i}function _a(e){const t=Ne[e];t&&(o.scoutingNetwork=e,It(),e==="none"?E("Jeugdscoutingnetwerk uitgeschakeld","info"):E(`${t.name} geactiveerd! Kosten: €${t.weeklyCost}/week`,"success"))}window.selectScoutingNetwork=_a;const Bt={trainingcamp:{name:"Trainingskamp",cost:2500,effect:"fitness",value:2},teamparty:{name:"Teamuitje",cost:1e3,effect:"chemistry",value:10},tactical:{name:"Tactische Sessie",cost:500,effect:"tactics",value:5}};function Oa(e){const t=Bt[e];if(t){if(o.club.budget<t.cost){E("Niet genoeg budget voor deze activiteit!","error");return}o.club.budget-=t.cost,t.effect==="fitness"?(o.players.forEach(n=>{n.attributes.FYS&&(n.attributes.FYS=Math.min(99,n.attributes.FYS+t.value))}),E(`Trainingskamp afgerond! Alle spelers +${t.value} FYS`,"success")):t.effect==="chemistry"?(o.teamChemistry=(o.teamChemistry||50)+t.value,E(`Teamuitje geslaagd! +${t.value}% teamchemie`,"success")):t.effect==="tactics"&&(o.nextMatchBonus=(o.nextMatchBonus||0)+t.value,E(`Tactische sessie gedaan! +${t.value}% volgende wedstrijd`,"success")),updateUI()}}function Fa(){document.querySelectorAll(".activity-card").forEach(e=>{const t=e.dataset.activity,n=Bt[t];if(n){const i=e.querySelector(".activity-cost");i&&(i.textContent=v(n.cost));const a=e.querySelector(".activity-btn");a&&(o.club.budget<n.cost?(a.disabled=!0,a.textContent="Te weinig budget"):(a.disabled=!1,a.textContent="Uitvoeren"))}})}window.startActivity=Oa;const Ha=[{id:"tr_keeper",name:"Keeperstrainer",icon:"🧤",cost:3e3,salary:200,effect:"Train keepers",position:"keeper"},{id:"tr_verdediging",name:"Verdedigingstrainer",icon:"🛡️",cost:3e3,salary:200,effect:"Train verdedigers",position:"verdediging"},{id:"tr_middenveld",name:"Middenveldtrainer",icon:"⚙️",cost:3e3,salary:200,effect:"Train middenvelders",position:"middenveld"},{id:"tr_aanval",name:"Aanvalstrainer",icon:"⚽",cost:3e3,salary:200,effect:"Train aanvallers",position:"aanval"},{id:"tr_conditie",name:"Conditietrainer",icon:"💪",cost:4e3,salary:300,effect:"+10% fitness hele team",position:"conditie"}],za=[{id:"st_assistent",name:"Assistent Manager",icon:"👔",cost:5e3,salary:400,effect:"+5% team prestatie"},{id:"st_fysio",name:"Fysiotherapeut",icon:"🏥",cost:4e3,salary:300,effect:"Sneller blessure herstel"},{id:"st_arts",name:"Clubarts",icon:"⚕️",cost:8e3,salary:500,effect:"Minder blessures"},{id:"st_mascotte",name:"Mascotte",icon:"🦁",cost:2e3,salary:100,effect:"+5% thuisvoordeel"}];window.hireScoutDirect=function(){if(o.hiredStaff||(o.hiredStaff={trainers:[],medisch:[]}),o.hiredStaff.medisch||(o.hiredStaff.medisch=[]),o.hiredStaff.medisch.includes("st_scout")){E("Je hebt al een scout!","info");return}if(o.club.budget<1){E("Niet genoeg budget!","error");return}o.club.budget-=1,o.hiredStaff.medisch.push("st_scout"),R(),te(),O(),E("Scout aangenomen! Je kunt nu scouten.","success")};function Lt(){Ga(),Ya()}function Ga(){const e=document.getElementById("trainers-staff-grid");if(!e)return;o.hiredStaff||(o.hiredStaff={trainers:[],medisch:[]});let t="";Ha.forEach(n=>{const i=o.hiredStaff.trainers?.includes(n.id);t+=Dt(n,i,"trainers")}),e.innerHTML=t}function Ya(){const e=document.getElementById("medisch-staff-grid");if(!e)return;o.hiredStaff||(o.hiredStaff={trainers:[],medisch:[]});let t="";za.forEach(n=>{const i=o.hiredStaff.medisch?.includes(n.id);t+=Dt(n,i,"medisch")}),e.innerHTML=t}function Dt(e,t,n){return`
        <div class="staff-hire-card ${t?"hired":""}">
            <div class="shc-icon">${e.icon}</div>
            <div class="shc-name">${e.name}</div>
            <div class="shc-desc">${e.effect}</div>
            ${t?`
                <div class="shc-status">✓ In dienst</div>
                <div class="shc-cost">€${e.salary}/week</div>
            `:`
                <div class="shc-cost">€${e.cost}</div>
                <button class="btn btn-sm btn-primary" onclick="hireStaff('${n}', '${e.id}', ${e.cost})">
                    Aannemen
                </button>
            `}
        </div>
    `}window.hireStaff=function(e,t,n){if(o.club.budget<n){E("Niet genoeg budget!","error");return}o.hiredStaff||(o.hiredStaff={trainers:[],medisch:[]}),o.hiredStaff[e]||(o.hiredStaff[e]=[]),o.hiredStaff[e].includes(t)||(o.hiredStaff[e].push(t),o.club.budget-=n,R(),Lt(),O(),E("Stafmedewerker aangenomen!","success"))};window.startScoutSearchFromStaff=function(){const e=parseInt(document.getElementById("scout-min-age-staff")?.value)||16,t=parseInt(document.getElementById("scout-max-age-staff")?.value)||35,n=document.getElementById("scout-position-staff")?.value||"all";o.scoutSearch={minAge:e,maxAge:t,position:n,results:[]};const i=[];for(let a=0;a<5;a++){const s=D(n==="all"?null:n,e+Math.floor(Math.random()*(t-e)),o.club.division);s.price=Math.floor(s.overall*100+Math.random()*5e3),i.push(s)}o.scoutSearch.results=i,renderScoutResults()};function Pt(){Lt()}window.hireStaffMember=function(e,t,n){if(o.club.budget<n){alert("Niet genoeg budget!");return}o.staffCenter||(o.staffCenter={assistantManager:[],medicalStaff:[],scoutStaff:[]}),o.staffCenter[e].includes(t)||(o.club.budget-=n,o.staffCenter[e].push(t),R(),Pt(),E("Nieuw staflid aangenomen!","success"))};function Ka(){const e=document.getElementById("corner-taker"),t=document.getElementById("penalty-taker"),n=document.getElementById("freekick-taker"),i=document.getElementById("captain-select");if(!e||!t||!n||!i)return;const s=[...o.players.filter(l=>!l.injured)].sort((l,c)=>{const u={K:1,V:2,M:3,A:4};return(u[l.position]||5)-(u[c.position]||5)}),r=(l,c)=>{let u='<option value="">-- Selecteer speler --</option>';return l.forEach(d=>{const f=d.id===c?"selected":"",p={K:"Keeper",V:"Verdediger",M:"Middenvelder",A:"Aanvaller"}[d.position]||d.position;u+=`<option value="${d.id}" ${f}>${d.name} (${p} - ${d.overall})</option>`}),u};o.specialists||(o.specialists={cornerTaker:null,penaltyTaker:null,freekickTaker:null,captain:null}),e.innerHTML=r(s,o.specialists.cornerTaker),t.innerHTML=r(s,o.specialists.penaltyTaker),n.innerHTML=r(s,o.specialists.freekickTaker),i.innerHTML=r(s,o.specialists.captain),e.onchange=l=>{o.specialists.cornerTaker=l.target.value||null,E("Cornernemer ingesteld","success")},t.onchange=l=>{o.specialists.penaltyTaker=l.target.value||null,E("Strafschopnemer ingesteld","success")},n.onchange=l=>{o.specialists.freekickTaker=l.target.value||null,E("Vrije trap nemer ingesteld","success")},i.onchange=l=>{o.specialists.captain=l.target.value||null,E("Aanvoerder ingesteld","success")}}const G={tribune:{description:"Vergroot de capaciteit om meer supporters te ontvangen en meer wedstrijdinkomsten te genereren.",levels:[{id:"tribune_1",name:"Houten Tribune",capacity:200,cost:0,effect:"200 toeschouwers"},{id:"tribune_2",name:"Stenen Tribune",capacity:500,cost:5e3,effect:"500 toeschouwers"},{id:"tribune_3",name:"Overdekte Tribune",capacity:1e3,cost:15e3,effect:"1.000 toeschouwers"},{id:"tribune_4",name:"Moderne Tribune",capacity:2500,cost:4e4,effect:"2.500 toeschouwers",reqCapacity:500},{id:"tribune_5",name:"Stadion Tribune",capacity:5e3,cost:1e5,effect:"5.000 toeschouwers",reqCapacity:1e3}],stateKey:"tribune"},grass:{description:"Beter gras geeft je team een thuisvoordeel tijdens wedstrijden.",levels:[{id:"grass_0",name:"Basis Gras",cost:0,effect:"Geen bonus"},{id:"grass_1",name:"Onderhouden Gras",cost:3e3,effect:"+5% thuisvoordeel"},{id:"grass_2",name:"Professioneel Gras",cost:8e3,effect:"+10% thuisvoordeel",reqCapacity:500},{id:"grass_3",name:"Kunstgras",cost:2e4,effect:"+15% thuisvoordeel",reqCapacity:1e3}],stateKey:"grass"},training:{description:"Beter trainingsfaciliteiten zorgen ervoor dat spelers sneller verbeteren.",levels:[{id:"train_1",name:"Basisveld",cost:0,effect:"+5% trainingssnelheid"},{id:"train_2",name:"Trainingsveld",cost:5e3,effect:"+10% trainingssnelheid"},{id:"train_3",name:"Modern Complex",cost:15e3,effect:"+20% trainingssnelheid",reqCapacity:500},{id:"train_4",name:"Elite Complex",cost:4e4,effect:"+30% trainingssnelheid",reqCapacity:1e3}],stateKey:"training"},medical:{description:"Betere medische voorzieningen verkorten de hersteltijd van geblesseerde spelers.",levels:[{id:"med_1",name:"EHBO Kist",cost:0,effect:"-10% blessureduur"},{id:"med_2",name:"Medische Kamer",cost:4e3,effect:"-20% blessureduur"},{id:"med_3",name:"Fysiotherapie",cost:12e3,effect:"-35% blessureduur",reqCapacity:500},{id:"med_4",name:"Medisch Centrum",cost:3e4,effect:"-50% blessureduur",reqCapacity:1e3}],stateKey:"medical"},academy:{description:"Een betere jeugdopleiding produceert talentvoller spelers.",levels:[{id:"acad_1",name:"Jeugdelftal",cost:0,effect:"Basistalent (40-55)"},{id:"acad_2",name:"Jeugdopleiding",cost:6e3,effect:"Beter talent (45-60)"},{id:"acad_3",name:"Voetbalschool",cost:18e3,effect:"Goed talent (50-65)",reqCapacity:500},{id:"acad_4",name:"Topacademie",cost:5e4,effect:"Toptalent (55-75)",reqCapacity:1e3}],stateKey:"academy"},scouting:{description:"Een groter scoutingnetwerk vindt betere en meer spelers.",levels:[{id:"scout_1",name:"Basisnetwerk",cost:0,effect:"Lokaal scouten"},{id:"scout_2",name:"Regionaal Netwerk",cost:4e3,effect:"Regionaal scouten"},{id:"scout_3",name:"Nationaal Netwerk",cost:12e3,effect:"Nationaal scouten",reqCapacity:500},{id:"scout_4",name:"Internationaal",cost:35e3,effect:"Internationaal scouten",reqCapacity:1e3}],stateKey:"scouting"},youthscouting:{description:"Betere jeugdscouting vindt talentvoller jeugdspelers voor je academie.",levels:[{id:"ysct_1",name:"Lokale Scouts",cost:0,effect:"Basis jeugdtalent"},{id:"ysct_2",name:"Regionale Scouts",cost:5e3,effect:"Beter jeugdtalent"},{id:"ysct_3",name:"Nationale Scouts",cost:15e3,effect:"Goed jeugdtalent",reqCapacity:500},{id:"ysct_4",name:"Elite Scouts",cost:4e4,effect:"Top jeugdtalent",reqCapacity:1e3}],stateKey:"youthscouting"},kantine:{description:"De kantine genereert extra inkomsten tijdens wedstrijden.",levels:[{id:"kantine_1",name:"Koffiehoek",cost:0,effect:"€50 per wedstrijd"},{id:"kantine_2",name:"Clubkantine",cost:3e3,effect:"€150 per wedstrijd"},{id:"kantine_3",name:"Restaurant",cost:1e4,effect:"€400 per wedstrijd",reqCapacity:500},{id:"kantine_4",name:"Horeca Complex",cost:25e3,effect:"€800 per wedstrijd",reqCapacity:1e3}],stateKey:"kantine"},sponsoring:{description:"Betere sponsorfaciliteiten trekken rijkere sponsors aan.",levels:[{id:"sponsor_1",name:"Lokale Sponsors",cost:0,effect:"Basis sponsordeals"},{id:"sponsor_2",name:"Regionale Sponsors",cost:5e3,effect:"Betere deals"},{id:"sponsor_3",name:"Grote Sponsors",cost:15e3,effect:"Premium deals",reqCapacity:500},{id:"sponsor_4",name:"Hoofdsponsors",cost:4e4,effect:"Top sponsordeals",reqCapacity:1e3}],stateKey:"sponsoring"},perszaal:{description:"Mediafaciliteiten vergroten de reputatie en bekendheid van je club.",levels:[{id:"pers_1",name:"Interview Hoek",cost:0,effect:"+5% reputatie"},{id:"pers_2",name:"Perszaal",cost:4e3,effect:"+10% reputatie"},{id:"pers_3",name:"Mediacentrum",cost:12e3,effect:"+20% reputatie",reqCapacity:500},{id:"pers_4",name:"Perscomplex",cost:3e4,effect:"+35% reputatie",reqCapacity:1e3}],stateKey:"perszaal"}};function Rt(){const e=document.getElementById("stadium-tiles-grid");if(!e)return;Object.entries(G).forEach(([n,i])=>{const a=o.stadium[i.stateKey],s=i.levels.findIndex(y=>y.id===a),r=i.levels[s]||i.levels[0],l=i.levels[s+1],c=!l,u=(s+1)/i.levels.length*100,d=document.getElementById(`tile-${n}-level`),f=document.getElementById(`tile-${n}-effect`),p=document.getElementById(`tile-${n}-cost`),m=document.getElementById(`tile-${n}-progress`),h=e.querySelector(`[data-category="${n}"]`);d&&(d.textContent=r.name),f&&(f.textContent=r.effect),p&&(p.textContent=c?"":v(l.cost),c&&(p.innerHTML='<span class="tile-max">MAX</span>')),m&&(m.style.width=`${u}%`),h&&h.classList.toggle("maxed",c)});const t=document.getElementById("stadium-capacity");t&&(t.textContent=o.stadium.capacity||200)}function Wa(e){const t=G[e];if(!t)return;const n=o.stadium[t.stateKey],i=t.levels.findIndex(c=>c.id===n),a=t.levels[i+1];if(!a){E("Dit is al op het hoogste niveau!","info");return}const s=o.club.budget>=a.cost,r={tribune:"Tribune",grass:"Grasveld",training:"Training",medical:"Medisch",academy:"Jeugdopleiding",scouting:"Scouting",kantine:"Kantine",sponsoring:"Sponsoring",perszaal:"Perszaal"},l=document.createElement("div");l.className="modal-overlay",l.innerHTML=`
        <div class="modal stadium-upgrade-modal">
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h2>Upgrade ${r[e]}</h2>
            <div class="upgrade-details">
                <div class="upgrade-from">
                    <h4>Huidig</h4>
                    <p class="level-name">${t.levels[i].name}</p>
                    <p class="level-effect">${t.levels[i].effect}</p>
                </div>
                <div class="upgrade-arrow">→</div>
                <div class="upgrade-to">
                    <h4>Upgrade naar</h4>
                    <p class="level-name">${a.name}</p>
                    <p class="level-effect">${a.effect}</p>
                </div>
            </div>
            <div class="upgrade-cost">
                <span class="cost-label">Kosten:</span>
                <span class="cost-value ${s?"":"cannot-afford"}">${v(a.cost)}</span>
            </div>
            <div class="upgrade-actions">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Annuleren</button>
                <button class="btn btn-primary" ${s?"":"disabled"} onclick="upgradeStadiumTile('${e}')">
                    ${s?"Upgraden":"Niet genoeg budget"}
                </button>
            </div>
        </div>
    `,document.body.appendChild(l)}function Ua(e){const t=G[e];if(!t)return;const n=o.stadium[t.stateKey],i=t.levels.findIndex(s=>s.id===n),a=t.levels[i+1];if(!a||o.club.budget<a.cost){E("Upgrade niet mogelijk!","error");return}o.club.budget-=a.cost,o.stadium[t.stateKey]=a.id,e==="tribune"&&a.capacity&&(o.stadium.capacity=a.capacity),document.querySelector(".modal-overlay")?.remove(),Rt(),R(),E(`${a.name} gebouwd!`,"success")}window.showStadiumUpgradeModal=Wa;window.upgradeStadiumTile=Ua;let Nt="tribune";function jt(e){Nt=e,document.querySelectorAll(".stadium-cat").forEach(t=>{t.classList.remove("active"),t.dataset.category===e&&t.classList.add("active")}),Vt(e)}function Ja(e,t){const i={tribune:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="120" width="400" height="60" fill="#4a7c4e"/>
                <rect x="0" y="0" width="400" height="40" fill="#87CEEB"/>
                <rect x="30" y="60" width="340" height="60" fill="#8B4513"/>
                <rect x="40" y="65" width="45" height="50" fill="#A0522D"/><rect x="90" y="65" width="45" height="50" fill="#A0522D"/>
                <rect x="140" y="65" width="45" height="50" fill="#A0522D"/><rect x="190" y="65" width="45" height="50" fill="#A0522D"/>
                <rect x="240" y="65" width="45" height="50" fill="#A0522D"/><rect x="290" y="65" width="45" height="50" fill="#A0522D"/>
                <rect x="340" y="65" width="45" height="50" fill="#A0522D"/>
                <circle cx="62" cy="55" r="8" fill="#ffcc80"/><circle cx="112" cy="55" r="8" fill="#ffcc80"/>
                <circle cx="162" cy="55" r="8" fill="#ffcc80"/><circle cx="212" cy="55" r="8" fill="#ffcc80"/>
                <circle cx="262" cy="55" r="8" fill="#ffcc80"/><circle cx="312" cy="55" r="8" fill="#ffcc80"/>
                <circle cx="362" cy="55" r="8" fill="#ffcc80"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="130" width="400" height="50" fill="#4a7c4e"/>
                <rect x="0" y="0" width="400" height="30" fill="#87CEEB"/>
                <rect x="0" y="40" width="400" height="90" fill="#78909c"/>
                <rect x="5" y="45" width="55" height="35" fill="#90a4ae"/><rect x="65" y="45" width="55" height="35" fill="#90a4ae"/>
                <rect x="125" y="45" width="55" height="35" fill="#90a4ae"/><rect x="185" y="45" width="55" height="35" fill="#90a4ae"/>
                <rect x="245" y="45" width="55" height="35" fill="#90a4ae"/><rect x="305" y="45" width="55" height="35" fill="#90a4ae"/>
                <rect x="365" y="45" width="35" height="35" fill="#90a4ae"/>
                <rect x="5" y="85" width="55" height="35" fill="#b0bec5"/><rect x="65" y="85" width="55" height="35" fill="#b0bec5"/>
                <rect x="125" y="85" width="55" height="35" fill="#b0bec5"/><rect x="185" y="85" width="55" height="35" fill="#b0bec5"/>
                <rect x="245" y="85" width="55" height="35" fill="#b0bec5"/><rect x="305" y="85" width="55" height="35" fill="#b0bec5"/>
                <rect x="365" y="85" width="35" height="35" fill="#b0bec5"/>
                <circle cx="32" cy="38" r="7" fill="#ffcc80"/><circle cx="92" cy="38" r="7" fill="#ffcc80"/><circle cx="152" cy="38" r="7" fill="#ffcc80"/>
                <circle cx="212" cy="38" r="7" fill="#ffcc80"/><circle cx="272" cy="38" r="7" fill="#ffcc80"/><circle cx="332" cy="38" r="7" fill="#ffcc80"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="140" width="400" height="40" fill="#4a7c4e"/>
                <rect x="0" y="0" width="400" height="20" fill="#87CEEB"/>
                <rect x="0" y="30" width="400" height="110" fill="#607d8b"/>
                <polygon points="0,30 200,5 400,30" fill="#455a64"/>
                <rect x="5" y="38" width="50" height="28" fill="#78909c"/><rect x="60" y="38" width="50" height="28" fill="#78909c"/>
                <rect x="115" y="38" width="50" height="28" fill="#78909c"/><rect x="170" y="38" width="50" height="28" fill="#78909c"/>
                <rect x="230" y="38" width="50" height="28" fill="#78909c"/><rect x="285" y="38" width="50" height="28" fill="#78909c"/>
                <rect x="340" y="38" width="55" height="28" fill="#78909c"/>
                <rect x="5" y="70" width="50" height="28" fill="#90a4ae"/><rect x="60" y="70" width="50" height="28" fill="#90a4ae"/>
                <rect x="115" y="70" width="50" height="28" fill="#90a4ae"/><rect x="170" y="70" width="50" height="28" fill="#90a4ae"/>
                <rect x="230" y="70" width="50" height="28" fill="#90a4ae"/><rect x="285" y="70" width="50" height="28" fill="#90a4ae"/>
                <rect x="340" y="70" width="55" height="28" fill="#90a4ae"/>
                <rect x="5" y="102" width="50" height="28" fill="#b0bec5"/><rect x="60" y="102" width="50" height="28" fill="#b0bec5"/>
                <rect x="115" y="102" width="50" height="28" fill="#b0bec5"/><rect x="170" y="102" width="50" height="28" fill="#b0bec5"/>
                <rect x="230" y="102" width="50" height="28" fill="#b0bec5"/><rect x="285" y="102" width="50" height="28" fill="#b0bec5"/>
                <rect x="340" y="102" width="55" height="28" fill="#b0bec5"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="145" width="400" height="35" fill="#4a7c4e"/>
                <rect x="0" y="0" width="400" height="130" fill="#37474f"/>
                <rect x="0" y="0" width="400" height="18" fill="#263238"/>
                <rect x="5" y="22" width="38" height="22" fill="#1b5e20"/><rect x="48" y="22" width="38" height="22" fill="#1b5e20"/>
                <rect x="91" y="22" width="38" height="22" fill="#1b5e20"/><rect x="134" y="22" width="38" height="22" fill="#1b5e20"/>
                <rect x="177" y="22" width="38" height="22" fill="#ff9800"/><rect x="220" y="22" width="38" height="22" fill="#ff9800"/>
                <rect x="263" y="22" width="38" height="22" fill="#1b5e20"/><rect x="306" y="22" width="38" height="22" fill="#1b5e20"/>
                <rect x="349" y="22" width="50" height="22" fill="#1b5e20"/>
                <rect x="5" y="48" width="38" height="22" fill="#2e7d32"/><rect x="48" y="48" width="38" height="22" fill="#2e7d32"/>
                <rect x="91" y="48" width="38" height="22" fill="#2e7d32"/><rect x="134" y="48" width="38" height="22" fill="#2e7d32"/>
                <rect x="177" y="48" width="38" height="22" fill="#2e7d32"/><rect x="220" y="48" width="38" height="22" fill="#2e7d32"/>
                <rect x="263" y="48" width="38" height="22" fill="#2e7d32"/><rect x="306" y="48" width="38" height="22" fill="#2e7d32"/>
                <rect x="349" y="48" width="50" height="22" fill="#2e7d32"/>
                <rect x="5" y="74" width="38" height="22" fill="#388e3c"/><rect x="48" y="74" width="38" height="22" fill="#388e3c"/>
                <rect x="91" y="74" width="38" height="22" fill="#388e3c"/><rect x="134" y="74" width="38" height="22" fill="#388e3c"/>
                <rect x="177" y="74" width="38" height="22" fill="#388e3c"/><rect x="220" y="74" width="38" height="22" fill="#388e3c"/>
                <rect x="263" y="74" width="38" height="22" fill="#388e3c"/><rect x="306" y="74" width="38" height="22" fill="#388e3c"/>
                <rect x="349" y="74" width="50" height="22" fill="#388e3c"/>
                <rect x="80" y="102" width="240" height="35" fill="#263238"/>
                <text x="200" y="125" text-anchor="middle" fill="#4caf50" font-size="14" font-family="sans-serif" font-weight="bold">VIP LOUNGE</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="150" width="400" height="30" fill="#4a7c4e"/>
                <ellipse cx="200" cy="155" rx="200" ry="50" fill="#37474f"/>
                <ellipse cx="200" cy="155" rx="160" ry="38" fill="#4a7c4e"/>
                <rect x="0" y="0" width="400" height="110" fill="#263238"/>
                <rect x="0" y="0" width="400" height="18" fill="#1b5e20"/>
                <rect x="175" y="20" width="50" height="85" fill="#ffeb3b" opacity="0.2"/>
                <text x="200" y="70" text-anchor="middle" fill="#ffeb3b" font-size="28" font-family="sans-serif">★</text>
                <rect x="5" y="22" width="35" height="18" fill="#1b5e20"/><rect x="45" y="22" width="35" height="18" fill="#1b5e20"/>
                <rect x="85" y="22" width="35" height="18" fill="#1b5e20"/><rect x="125" y="22" width="35" height="18" fill="#ff9800"/>
                <rect x="165" y="22" width="35" height="18" fill="#ff9800"/><rect x="245" y="22" width="35" height="18" fill="#ff9800"/>
                <rect x="285" y="22" width="35" height="18" fill="#1b5e20"/><rect x="325" y="22" width="35" height="18" fill="#1b5e20"/>
                <rect x="365" y="22" width="35" height="18" fill="#1b5e20"/>
                <circle cx="20" cy="130" r="5" fill="#fff176"/><circle cx="50" cy="130" r="5" fill="#fff176"/>
                <circle cx="80" cy="130" r="5" fill="#fff176"/><circle cx="110" cy="130" r="5" fill="#fff176"/>
                <circle cx="290" cy="130" r="5" fill="#fff176"/><circle cx="320" cy="130" r="5" fill="#fff176"/>
                <circle cx="350" cy="130" r="5" fill="#fff176"/><circle cx="380" cy="130" r="5" fill="#fff176"/>
            </svg>`],grass:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#8bc34a"/>
                <rect x="0" y="0" width="400" height="180" fill="#7cb342" stroke="white" stroke-width="3"/>
                <circle cx="200" cy="90" r="35" fill="none" stroke="white" stroke-width="3"/>
                <line x1="200" y1="0" x2="200" y2="180" stroke="white" stroke-width="3"/>
                <rect x="0" y="45" width="50" height="90" fill="none" stroke="white" stroke-width="3"/>
                <rect x="350" y="45" width="50" height="90" fill="none" stroke="white" stroke-width="3"/>
                <ellipse cx="100" cy="60" rx="20" ry="10" fill="#6a9c3a"/>
                <ellipse cx="300" cy="120" rx="25" ry="12" fill="#6a9c3a"/>
                <ellipse cx="150" cy="140" rx="30" ry="14" fill="#5d8a32"/>
                <ellipse cx="280" cy="50" rx="18" ry="9" fill="#5d8a32"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#81c784"/>
                <rect x="0" y="0" width="40" height="180" fill="#7cb342"/>
                <rect x="80" y="0" width="40" height="180" fill="#7cb342"/>
                <rect x="160" y="0" width="40" height="180" fill="#7cb342"/>
                <rect x="240" y="0" width="40" height="180" fill="#7cb342"/>
                <rect x="320" y="0" width="40" height="180" fill="#7cb342"/>
                <circle cx="200" cy="90" r="40" fill="none" stroke="white" stroke-width="3"/>
                <line x1="200" y1="0" x2="200" y2="180" stroke="white" stroke-width="3"/>
                <rect x="0" y="45" width="55" height="90" fill="none" stroke="white" stroke-width="3"/>
                <rect x="345" y="45" width="55" height="90" fill="none" stroke="white" stroke-width="3"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#4caf50"/>
                <rect x="0" y="0" width="35" height="180" fill="#66bb6a"/>
                <rect x="70" y="0" width="35" height="180" fill="#66bb6a"/>
                <rect x="140" y="0" width="35" height="180" fill="#66bb6a"/>
                <rect x="210" y="0" width="35" height="180" fill="#66bb6a"/>
                <rect x="280" y="0" width="35" height="180" fill="#66bb6a"/>
                <rect x="350" y="0" width="50" height="180" fill="#66bb6a"/>
                <circle cx="200" cy="90" r="45" fill="none" stroke="white" stroke-width="4"/>
                <circle cx="200" cy="90" r="5" fill="white"/>
                <line x1="200" y1="0" x2="200" y2="180" stroke="white" stroke-width="4"/>
                <rect x="0" y="35" width="65" height="110" fill="none" stroke="white" stroke-width="4"/>
                <rect x="335" y="35" width="65" height="110" fill="none" stroke="white" stroke-width="4"/>
                <rect x="0" y="55" width="32" height="70" fill="none" stroke="white" stroke-width="3"/>
                <rect x="368" y="55" width="32" height="70" fill="none" stroke="white" stroke-width="3"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#388e3c"/>
                <defs>
                    <pattern id="turf" patternUnits="userSpaceOnUse" width="20" height="20">
                        <rect width="20" height="20" fill="#43a047"/>
                        <rect x="0" y="0" width="10" height="10" fill="#4caf50"/>
                        <rect x="10" y="10" width="10" height="10" fill="#4caf50"/>
                    </pattern>
                </defs>
                <rect x="0" y="0" width="400" height="180" fill="url(#turf)" opacity="0.5"/>
                <circle cx="200" cy="90" r="50" fill="none" stroke="white" stroke-width="5"/>
                <circle cx="200" cy="90" r="6" fill="white"/>
                <line x1="200" y1="0" x2="200" y2="180" stroke="white" stroke-width="5"/>
                <rect x="0" y="30" width="75" height="120" fill="none" stroke="white" stroke-width="5"/>
                <rect x="325" y="30" width="75" height="120" fill="none" stroke="white" stroke-width="5"/>
                <rect x="0" y="50" width="38" height="80" fill="none" stroke="white" stroke-width="4"/>
                <rect x="362" y="50" width="38" height="80" fill="none" stroke="white" stroke-width="4"/>
                <circle cx="38" cy="90" r="4" fill="white"/><circle cx="362" cy="90" r="4" fill="white"/>
            </svg>`],training:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#8bc34a"/>
                <rect x="20" y="30" width="160" height="100" fill="#7cb342" stroke="#fff" stroke-width="3" stroke-dasharray="8,4"/>
                <circle cx="320" cy="80" r="45" fill="none" stroke="white" stroke-width="3"/>
                <rect x="250" y="130" width="130" height="50" fill="#5d4037"/>
                <rect x="260" y="138" width="110" height="35" fill="#8d6e63"/>
                <circle cx="100" cy="80" r="12" fill="#fff"/><circle cx="100" cy="80" r="6" fill="#333"/>
                <line x1="200" y1="60" x2="200" y2="100" stroke="#fff" stroke-width="4"/>
                <line x1="175" y1="80" x2="225" y2="80" stroke="#fff" stroke-width="4"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#7cb342"/>
                <rect x="0" y="15" width="190" height="100" fill="#689f38" stroke="#fff" stroke-width="3"/>
                <rect x="210" y="15" width="190" height="100" fill="#689f38" stroke="#fff" stroke-width="3"/>
                <rect x="10" y="130" width="80" height="45" fill="#5d4037"/><rect x="110" y="130" width="80" height="45" fill="#5d4037"/>
                <rect x="210" y="130" width="80" height="45" fill="#5d4037"/><rect x="310" y="130" width="80" height="45" fill="#5d4037"/>
                <circle cx="95" cy="65" r="30" fill="none" stroke="#fff" stroke-width="3"/>
                <circle cx="305" cy="65" r="30" fill="none" stroke="#fff" stroke-width="3"/>
                <rect x="50" y="25" width="10" height="60" fill="#ff9800"/><rect x="130" y="25" width="10" height="60" fill="#ff9800"/>
                <rect x="260" y="25" width="10" height="60" fill="#2196f3"/><rect x="340" y="25" width="10" height="60" fill="#2196f3"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#558b2f"/>
                <rect x="0" y="5" width="195" height="85" fill="#689f38" stroke="#fff" stroke-width="3"/>
                <rect x="205" y="5" width="195" height="85" fill="#689f38" stroke="#fff" stroke-width="3"/>
                <rect x="0" y="100" width="130" height="80" fill="#455a64"/>
                <rect x="10" y="110" width="50" height="28" fill="#78909c"/><rect x="70" y="110" width="50" height="28" fill="#78909c"/>
                <rect x="10" y="145" width="50" height="28" fill="#78909c"/><rect x="70" y="145" width="50" height="28" fill="#78909c"/>
                <rect x="140" y="100" width="120" height="80" fill="#37474f"/>
                <text x="200" y="148" text-anchor="middle" fill="#4caf50" font-size="14" font-family="sans-serif" font-weight="bold">FITNESS</text>
                <rect x="270" y="100" width="130" height="80" fill="#455a64"/>
                <circle cx="335" cy="140" r="28" fill="#29b6f6"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#33691e"/>
                <rect x="0" y="0" width="130" height="60" fill="#558b2f" stroke="#ffd700" stroke-width="2"/>
                <rect x="135" y="0" width="130" height="60" fill="#558b2f" stroke="#ffd700" stroke-width="2"/>
                <rect x="270" y="0" width="130" height="60" fill="#558b2f" stroke="#ffd700" stroke-width="2"/>
                <rect x="0" y="65" width="200" height="55" fill="#263238"/>
                <text x="100" y="98" text-anchor="middle" fill="#ffd700" font-size="14" font-family="sans-serif" font-weight="bold">⭐ ELITE GYM ⭐</text>
                <rect x="200" y="65" width="200" height="55" fill="#1565c0"/>
                <text x="300" y="98" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif" font-weight="bold">🏊 ZWEMBAD</text>
                <rect x="0" y="125" width="133" height="55" fill="#37474f"/>
                <text x="66" y="158" text-anchor="middle" fill="#4caf50" font-size="11" font-family="sans-serif">ANALYSE LAB</text>
                <rect x="133" y="125" width="134" height="55" fill="#4e342e"/>
                <text x="200" y="158" text-anchor="middle" fill="#ffcc80" font-size="11" font-family="sans-serif">SAUNA</text>
                <rect x="267" y="125" width="133" height="55" fill="#1b5e20"/>
                <text x="333" y="158" text-anchor="middle" fill="white" font-size="11" font-family="sans-serif">RECOVERY</text>
            </svg>`],medical:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8f5e9"/>
                <rect x="130" y="30" width="140" height="100" fill="#fff" stroke="#e53935" stroke-width="4"/>
                <rect x="180" y="45" width="40" height="70" fill="#e53935"/>
                <rect x="145" y="65" width="110" height="40" fill="#e53935"/>
                <rect x="0" y="130" width="120" height="50" fill="#8d6e63"/>
                <rect x="280" y="130" width="120" height="50" fill="#8d6e63"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e3f2fd"/>
                <rect x="50" y="15" width="300" height="140" fill="#fff" stroke="#1976d2" stroke-width="4"/>
                <rect x="70" y="35" width="110" height="50" fill="#bbdefb"/><rect x="220" y="35" width="110" height="50" fill="#bbdefb"/>
                <rect x="120" y="100" width="160" height="45" fill="#90caf9"/>
                <circle cx="200" cy="122" r="16" fill="#e53935"/><rect x="193" y="108" width="14" height="28" fill="#fff"/>
                <rect x="188" y="115" width="24" height="14" fill="#fff"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e1f5fe"/>
                <rect x="0" y="10" width="400" height="145" fill="#fff" stroke="#0288d1" stroke-width="4"/>
                <rect x="15" y="30" width="115" height="60" fill="#b3e5fc"/>
                <rect x="145" y="30" width="115" height="60" fill="#81d4fa"/>
                <rect x="275" y="30" width="110" height="60" fill="#4fc3f7"/>
                <rect x="80" y="105" width="240" height="45" fill="#0288d1"/>
                <text x="200" y="135" text-anchor="middle" fill="white" font-size="14" font-weight="bold">FYSIOTHERAPIE</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8eaf6"/>
                <rect x="0" y="0" width="400" height="180" fill="#fff" stroke="#303f9f" stroke-width="4"/>
                <rect x="10" y="15" width="120" height="70" fill="#c5cae9"/><rect x="140" y="15" width="120" height="70" fill="#9fa8da"/>
                <rect x="270" y="15" width="120" height="70" fill="#7986cb"/>
                <rect x="10" y="95" width="190" height="75" fill="#3f51b5"/>
                <text x="105" y="140" text-anchor="middle" fill="white" font-size="13" font-weight="bold">MRI SCANNER</text>
                <rect x="200" y="95" width="190" height="75" fill="#1a237e"/>
                <text x="295" y="140" text-anchor="middle" fill="white" font-size="13" font-weight="bold">OPERATIEKAMER</text>
            </svg>`],academy:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#c8e6c9"/>
                <rect x="0" y="90" width="400" height="90" fill="#8bc34a"/>
                <circle cx="100" cy="65" r="25" fill="#ffcc80"/><circle cx="200" cy="60" r="22" fill="#ffcc80"/><circle cx="300" cy="65" r="25" fill="#ffcc80"/>
                <rect x="88" y="80" width="24" height="50" fill="#1976d2"/><rect x="188" y="78" width="24" height="52" fill="#388e3c"/><rect x="288" y="80" width="24" height="50" fill="#d32f2f"/>
                <circle cx="200" cy="140" r="20" fill="#fff" stroke="#333" stroke-width="3"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#a5d6a7"/>
                <rect x="0" y="70" width="400" height="110" fill="#66bb6a"/>
                <rect x="20" y="10" width="160" height="60" fill="#5d4037"/>
                <rect x="220" y="10" width="160" height="60" fill="#5d4037"/>
                <circle cx="60" cy="95" r="18" fill="#ffcc80"/><circle cx="130" cy="90" r="16" fill="#ffcc80"/><circle cx="200" cy="95" r="18" fill="#ffcc80"/>
                <circle cx="270" cy="90" r="16" fill="#ffcc80"/><circle cx="340" cy="95" r="18" fill="#ffcc80"/>
                <rect x="50" y="108" width="20" height="35" fill="#1976d2"/><rect x="120" y="105" width="20" height="35" fill="#1976d2"/>
                <rect x="190" y="108" width="20" height="35" fill="#1976d2"/><rect x="260" y="105" width="20" height="35" fill="#1976d2"/>
                <rect x="330" y="108" width="20" height="35" fill="#1976d2"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#81c784"/>
                <rect x="0" y="50" width="195" height="130" fill="#4caf50" stroke="#fff" stroke-width="3"/>
                <rect x="205" y="50" width="195" height="130" fill="#388e3c" stroke="#fff" stroke-width="3"/>
                <rect x="100" y="5" width="200" height="45" fill="#5d4037"/>
                <text x="200" y="35" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">VOETBALSCHOOL</text>
                <circle cx="50" cy="100" r="16" fill="#ffcc80"/><circle cx="100" cy="95" r="14" fill="#ffcc80"/>
                <circle cx="150" cy="100" r="16" fill="#ffcc80"/>
                <circle cx="250" cy="100" r="16" fill="#ffcc80"/><circle cx="300" cy="95" r="14" fill="#ffcc80"/>
                <circle cx="350" cy="100" r="16" fill="#ffcc80"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#4caf50"/>
                <rect x="0" y="40" width="400" height="140" fill="#2e7d32" stroke="#ffd700" stroke-width="4"/>
                <rect x="120" y="0" width="160" height="42" fill="#ffd700"/>
                <text x="200" y="28" text-anchor="middle" fill="#333" font-size="16" font-weight="bold">TOPACADEMIE</text>
                <circle cx="50" cy="100" r="20" fill="#ffcc80"/><circle cx="120" cy="95" r="17" fill="#ffcc80"/>
                <circle cx="190" cy="100" r="20" fill="#ffcc80"/><circle cx="260" cy="100" r="20" fill="#ffcc80"/>
                <circle cx="330" cy="95" r="17" fill="#ffcc80"/><circle cx="390" cy="100" r="20" fill="#ffcc80"/>
                <text x="50" y="145" text-anchor="middle" fill="#ffd700" font-size="20">★</text>
                <text x="200" y="145" text-anchor="middle" fill="#ffd700" font-size="20">★</text>
                <text x="350" y="145" text-anchor="middle" fill="#ffd700" font-size="20">★</text>
            </svg>`],scouting:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8f5e9"/>
                <circle cx="200" cy="90" r="70" fill="#c8e6c9" stroke="#4caf50" stroke-width="4"/>
                <circle cx="200" cy="90" r="50" fill="#a5d6a7"/>
                <circle cx="200" cy="90" r="30" fill="#81c784"/>
                <circle cx="200" cy="90" r="8" fill="#4caf50"/>
                <circle cx="170" cy="70" r="10" fill="#ffcc80"/><circle cx="230" cy="105" r="8" fill="#ffcc80"/>
                <circle cx="120" cy="100" r="6" fill="#ffcc80"/><circle cx="280" cy="80" r="7" fill="#ffcc80"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e3f2fd"/>
                <ellipse cx="200" cy="90" rx="190" ry="80" fill="#bbdefb" stroke="#1976d2" stroke-width="3"/>
                <ellipse cx="200" cy="90" rx="130" ry="55" fill="#90caf9"/>
                <ellipse cx="200" cy="90" rx="70" ry="30" fill="#64b5f6"/>
                <circle cx="80" cy="70" r="10" fill="#ffcc80"/><circle cx="200" cy="50" r="8" fill="#ffcc80"/>
                <circle cx="320" cy="80" r="9" fill="#ffcc80"/><circle cx="140" cy="120" r="7" fill="#ffcc80"/>
                <circle cx="260" cy="115" r="8" fill="#ffcc80"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fff3e0"/>
                <ellipse cx="200" cy="90" rx="200" ry="85" fill="#ffe0b2" stroke="#ff9800" stroke-width="3"/>
                <path d="M50 90 Q200 20 350 90 Q200 160 50 90" fill="#ffcc80"/>
                <circle cx="60" cy="90" r="8" fill="#d32f2f"/><circle cx="130" cy="55" r="7" fill="#1976d2"/>
                <circle cx="200" cy="40" r="9" fill="#388e3c"/><circle cx="270" cy="60" r="7" fill="#7b1fa2"/>
                <circle cx="340" cy="90" r="8" fill="#ff9800"/><circle cx="270" cy="125" r="7" fill="#00796b"/>
                <circle cx="130" cy="130" r="8" fill="#c2185b"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#1a237e"/>
                <circle cx="200" cy="90" r="75" fill="#3f51b5"/>
                <ellipse cx="200" cy="90" rx="100" ry="45" fill="none" stroke="#7986cb" stroke-width="2"/>
                <ellipse cx="200" cy="90" rx="140" ry="65" fill="none" stroke="#9fa8da" stroke-width="2"/>
                <ellipse cx="200" cy="90" rx="180" ry="80" fill="none" stroke="#c5cae9" stroke-width="2"/>
                <circle cx="50" cy="50" r="5" fill="#ffeb3b"/><circle cx="100" cy="140" r="4" fill="#ffeb3b"/>
                <circle cx="200" cy="25" r="6" fill="#ffeb3b"/><circle cx="300" cy="60" r="5" fill="#ffeb3b"/>
                <circle cx="350" cy="120" r="4" fill="#ffeb3b"/><circle cx="140" cy="35" r="4" fill="#ffeb3b"/>
                <circle cx="260" cy="155" r="5" fill="#ffeb3b"/>
                <rect x="360" y="10" width="35" height="25" fill="#78909c"/>
                <rect x="367" y="0" width="6" height="12" fill="#90a4ae"/><rect x="382" y="0" width="6" height="12" fill="#90a4ae"/>
            </svg>`],youthscouting:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#f3e5f5"/>
                <rect x="0" y="30" width="400" height="120" fill="#e1bee7" stroke="#9c27b0" stroke-width="3"/>
                <circle cx="100" cy="80" r="25" fill="#ffcc80"/><circle cx="200" cy="75" r="20" fill="#ffcc80"/><circle cx="300" cy="80" r="23" fill="#ffcc80"/>
                <rect x="90" y="100" width="20" height="35" fill="#7b1fa2"/><rect x="190" y="95" width="20" height="35" fill="#7b1fa2"/>
                <rect x="290" y="100" width="20" height="35" fill="#7b1fa2"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8eaf6"/>
                <rect x="0" y="25" width="400" height="130" fill="#c5cae9" stroke="#3f51b5" stroke-width="3"/>
                <circle cx="50" cy="80" r="22" fill="#ffcc80"/><circle cx="130" cy="75" r="19" fill="#ffcc80"/>
                <circle cx="210" cy="80" r="22" fill="#ffcc80"/><circle cx="290" cy="75" r="19" fill="#ffcc80"/>
                <circle cx="370" cy="80" r="22" fill="#ffcc80"/>
                <text x="50" y="130" text-anchor="middle" fill="#3f51b5" font-size="18">⭐</text>
                <text x="210" y="130" text-anchor="middle" fill="#3f51b5" font-size="18">⭐</text>
                <text x="370" y="130" text-anchor="middle" fill="#3f51b5" font-size="18">⭐</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e0f7fa"/>
                <rect x="0" y="20" width="400" height="140" fill="#b2ebf2" stroke="#00acc1" stroke-width="4"/>
                <rect x="120" y="0" width="160" height="28" fill="#00838f"/>
                <text x="200" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">SCOUTRAPPORT</text>
                <circle cx="60" cy="75" r="25" fill="#ffcc80"/><circle cx="160" cy="70" r="22" fill="#ffcc80"/>
                <circle cx="260" cy="75" r="25" fill="#ffcc80"/><circle cx="360" cy="70" r="22" fill="#ffcc80"/>
                <text x="60" y="125" text-anchor="middle" fill="#00838f" font-size="16" font-weight="bold">A</text>
                <text x="160" y="125" text-anchor="middle" fill="#00838f" font-size="16" font-weight="bold">B+</text>
                <text x="260" y="125" text-anchor="middle" fill="#ffd700" font-size="20">★</text>
                <text x="360" y="125" text-anchor="middle" fill="#00838f" font-size="16" font-weight="bold">A-</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fff8e1"/>
                <rect x="0" y="10" width="400" height="160" fill="#ffecb3" stroke="#ffa000" stroke-width="4"/>
                <polygon points="200,20 215,55 255,55 223,80 235,120 200,95 165,120 177,80 145,55 185,55" fill="#ffd700"/>
                <circle cx="50" cy="95" r="28" fill="#ffcc80" stroke="#ffa000" stroke-width="3"/>
                <circle cx="140" cy="90" r="25" fill="#ffcc80" stroke="#ffa000" stroke-width="3"/>
                <circle cx="260" cy="90" r="25" fill="#ffcc80" stroke="#ffa000" stroke-width="3"/>
                <circle cx="350" cy="95" r="28" fill="#ffcc80" stroke="#ffa000" stroke-width="3"/>
                <text x="50" y="145" text-anchor="middle" fill="#ff6f00" font-size="18">★</text>
                <text x="140" y="145" text-anchor="middle" fill="#ff6f00" font-size="18">★</text>
                <text x="260" y="145" text-anchor="middle" fill="#ff6f00" font-size="18">★</text>
                <text x="350" y="145" text-anchor="middle" fill="#ff6f00" font-size="18">★</text>
            </svg>`],kantine:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#efebe9"/>
                <rect x="50" y="40" width="300" height="120" fill="#8d6e63" stroke="#5d4037" stroke-width="4"/>
                <rect x="160" y="90" width="80" height="70" fill="#5d4037"/>
                <rect x="80" y="60" width="50" height="55" fill="#a1887f"/>
                <rect x="270" y="60" width="50" height="55" fill="#a1887f"/>
                <ellipse cx="200" cy="30" rx="45" ry="22" fill="#795548"/>
                <text x="200" y="38" text-anchor="middle" fill="white" font-size="16">☕</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fff3e0"/>
                <rect x="0" y="35" width="400" height="130" fill="#ffcc80" stroke="#ff9800" stroke-width="4"/>
                <rect x="20" y="55" width="130" height="70" fill="#ffe0b2"/>
                <rect x="250" y="55" width="130" height="70" fill="#ffe0b2"/>
                <rect x="140" y="130" width="120" height="50" fill="#5d4037"/>
                <ellipse cx="85" cy="30" rx="30" ry="18" fill="#ff9800"/>
                <text x="85" y="38" text-anchor="middle" fill="white" font-size="14">🍺</text>
                <ellipse cx="315" cy="30" rx="30" ry="18" fill="#ff9800"/>
                <text x="315" y="38" text-anchor="middle" fill="white" font-size="14">🍺</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fce4ec"/>
                <rect x="0" y="25" width="400" height="140" fill="#f8bbd9" stroke="#e91e63" stroke-width="4"/>
                <rect x="15" y="45" width="110" height="60" fill="#fff"/>
                <rect x="145" y="45" width="110" height="60" fill="#fff"/>
                <rect x="275" y="45" width="110" height="60" fill="#fff"/>
                <rect x="80" y="120" width="240" height="50" fill="#c2185b"/>
                <text x="200" y="152" text-anchor="middle" fill="white" font-size="16" font-weight="bold">KEUKEN</text>
                <circle cx="70" cy="75" r="20" fill="#ffcc80"/><circle cx="200" cy="75" r="20" fill="#ffcc80"/>
                <circle cx="330" cy="75" r="20" fill="#ffcc80"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8eaf6"/>
                <rect x="0" y="15" width="400" height="150" fill="#c5cae9" stroke="#3f51b5" stroke-width="5"/>
                <rect x="10" y="25" width="125" height="65" fill="#fff"/><rect x="145" y="25" width="125" height="65" fill="#fff"/>
                <rect x="280" y="25" width="110" height="65" fill="#fff"/>
                <rect x="10" y="100" width="195" height="60" fill="#1a237e"/>
                <text x="107" y="138" text-anchor="middle" fill="#ffd700" font-size="14" font-weight="bold">⭐ VIP LOUNGE ⭐</text>
                <rect x="210" y="100" width="180" height="60" fill="#283593"/>
                <text x="300" y="138" text-anchor="middle" fill="white" font-size="14" font-weight="bold">SKYBOX</text>
            </svg>`],sponsoring:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#f5f5f5"/>
                <rect x="50" y="30" width="300" height="120" fill="#fff" stroke="#9e9e9e" stroke-width="3"/>
                <rect x="80" y="55" width="240" height="70" fill="#e0e0e0"/>
                <text x="200" y="98" text-anchor="middle" fill="#616161" font-size="16" font-weight="bold">LOKALE SPONSOR</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e3f2fd"/>
                <rect x="10" y="25" width="185" height="90" fill="#fff" stroke="#1976d2" stroke-width="3"/>
                <rect x="205" y="25" width="185" height="90" fill="#fff" stroke="#1976d2" stroke-width="3"/>
                <text x="102" y="78" text-anchor="middle" fill="#1976d2" font-size="14" font-weight="bold">SPONSOR A</text>
                <text x="297" y="78" text-anchor="middle" fill="#1976d2" font-size="14" font-weight="bold">SPONSOR B</text>
                <rect x="100" y="125" width="200" height="50" fill="#1565c0"/>
                <text x="200" y="158" text-anchor="middle" fill="white" font-size="14" font-weight="bold">🤝 PARTNERSHIP</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8f5e9"/>
                <rect x="5" y="15" width="125" height="80" fill="#fff" stroke="#388e3c" stroke-width="3"/>
                <rect x="140" y="15" width="125" height="80" fill="#fff" stroke="#388e3c" stroke-width="3"/>
                <rect x="275" y="15" width="120" height="80" fill="#fff" stroke="#388e3c" stroke-width="3"/>
                <text x="67" y="60" text-anchor="middle" fill="#2e7d32" font-size="12" font-weight="bold">PREMIUM</text>
                <text x="202" y="60" text-anchor="middle" fill="#2e7d32" font-size="12" font-weight="bold">PREMIUM</text>
                <text x="335" y="60" text-anchor="middle" fill="#2e7d32" font-size="12" font-weight="bold">PREMIUM</text>
                <rect x="50" y="105" width="300" height="65" fill="#1b5e20"/>
                <text x="200" y="145" text-anchor="middle" fill="white" font-size="16" font-weight="bold">💼 GROTE SPONSORS</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fff8e1"/>
                <rect x="0" y="10" width="400" height="160" fill="#ffecb3" stroke="#ffa000" stroke-width="4"/>
                <polygon points="200,20 218,65 270,65 228,95 245,145 200,115 155,145 172,95 130,65 182,65" fill="#ffd700"/>
                <rect x="10" y="40" width="100" height="60" fill="#fff" stroke="#ff8f00" stroke-width="3"/>
                <rect x="290" y="40" width="100" height="60" fill="#fff" stroke="#ff8f00" stroke-width="3"/>
                <text x="60" y="78" text-anchor="middle" fill="#ff6f00" font-size="12" font-weight="bold">PLATINUM</text>
                <text x="340" y="78" text-anchor="middle" fill="#ff6f00" font-size="12" font-weight="bold">PLATINUM</text>
            </svg>`],perszaal:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#eceff1"/>
                <rect x="50" y="35" width="300" height="120" fill="#cfd8dc" stroke="#607d8b" stroke-width="3"/>
                <rect x="150" y="55" width="100" height="55" fill="#455a64"/>
                <circle cx="200" cy="82" r="15" fill="#263238"/>
                <rect x="100" y="120" width="200" height="30" fill="#78909c"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e0e0e0"/>
                <rect x="0" y="25" width="400" height="130" fill="#bdbdbd" stroke="#757575" stroke-width="4"/>
                <rect x="130" y="35" width="140" height="70" fill="#424242"/>
                <circle cx="200" cy="70" r="20" fill="#212121"/>
                <rect x="30" y="115" width="90" height="35" fill="#616161"/>
                <rect x="155" y="115" width="90" height="35" fill="#616161"/>
                <rect x="280" y="115" width="90" height="35" fill="#616161"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e3f2fd"/>
                <rect x="0" y="15" width="400" height="150" fill="#bbdefb" stroke="#1976d2" stroke-width="4"/>
                <rect x="100" y="25" width="200" height="90" fill="#0d47a1"/>
                <rect x="115" y="38" width="170" height="65" fill="#1565c0"/>
                <text x="200" y="80" text-anchor="middle" fill="white" font-size="18" font-weight="bold">📺 LIVE</text>
                <circle cx="40" cy="135" r="20" fill="#ffcc80"/><circle cx="100" cy="135" r="20" fill="#ffcc80"/>
                <circle cx="300" cy="135" r="20" fill="#ffcc80"/><circle cx="360" cy="135" r="20" fill="#ffcc80"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fce4ec"/>
                <rect x="0" y="10" width="400" height="160" fill="#f8bbd9" stroke="#c2185b" stroke-width="5"/>
                <rect x="90" y="20" width="220" height="100" fill="#880e4f"/>
                <rect x="105" y="32" width="190" height="76" fill="#ad1457"/>
                <text x="200" y="80" text-anchor="middle" fill="white" font-size="20" font-weight="bold">🎬 STUDIO</text>
                <rect x="15" y="130" width="110" height="40" fill="#6a1b9a"/>
                <rect x="145" y="130" width="110" height="40" fill="#4a148c"/>
                <rect x="275" y="130" width="110" height="40" fill="#6a1b9a"/>
            </svg>`]}[e];return i?i[t]||i[i.length-1]:""}function Vt(e){const t=G[e];if(!t)return;const n={tribune:"🏟️",grass:"🌱",training:"💪",medical:"🏥",academy:"🎓",scouting:"🔍",youthscouting:"👶",kantine:"🍺",sponsoring:"💼",perszaal:"📰"},i={tribune:"Stadion",grass:"Wedstrijdveld",training:"Trainingsveld",medical:"Medische Voorzieningen",academy:"Jeugdopleiding",scouting:"Scouting",youthscouting:"Jeugdscouting",kantine:"Kantine",sponsoring:"Sponsoring",perszaal:"Perszaal"},a={tribune:["🪵","🧱","🏗️","🏟️","🏟️"],grass:["🌾","🌿","🌱","✨"],training:["⚽","🥅","🏋️","🎯"],medical:["🩹","💊","🏥","🏨"],academy:["👦","⚽","🎓","🏆"],scouting:["👀","🔭","🌍","🛰️"],youthscouting:["👶","🔍","📋","⭐"],kantine:["☕","🍺","🍽️","🏪"],sponsoring:["📄","🤝","💼","💎"],perszaal:["📝","🎤","📺","🎬"]};o.stadium.youthscouting||(o.stadium.youthscouting="ysct_1");const s=o.stadium[t.stateKey],r=t.levels.findIndex(Z=>Z.id===s),l=t.levels[r]||t.levels[0],c=t.levels[r+1],u=!c,d=G.tribune.levels.find(Z=>Z.id===o.stadium.tribune)?.capacity||200,f=c?.reqCapacity&&d<c.reqCapacity,p=document.getElementById("detail-icon"),m=document.getElementById("detail-title"),h=document.getElementById("detail-level"),y=document.getElementById("detail-description"),x=document.getElementById("detail-current-effect"),k=document.getElementById("detail-next-effect"),b=document.getElementById("detail-current-image"),M=document.getElementById("detail-next-image"),$=document.getElementById("detail-cost"),A=document.getElementById("detail-requirement"),C=document.getElementById("detail-req-text"),I=document.getElementById("btn-upgrade-stadium"),N=a[e]||["❓","❓","❓","❓"],F=N[r]||N[0],xe=N[r+1]||N[N.length-1];p&&(p.textContent=n[e]||"🏟️"),m&&(m.textContent=i[e]||e),h&&(h.textContent=`Niveau ${r+1}`),y&&(y.textContent=t.description||""),x&&(x.textContent=l.effect),b&&(b.textContent=F);const le=document.getElementById("detail-illustration");if(le&&(le.innerHTML=Ja(e,r)),u)$&&($.textContent="MAX"),k&&(k.textContent="Maximaal bereikt"),M&&(M.textContent="✅"),A&&(A.style.display="none"),I&&(I.disabled=!0,I.textContent="Maximaal");else{const Z=o.club.budget>=c.cost;$&&($.textContent=v(c.cost)),k&&(k.textContent=c.effect),M&&(M.textContent=xe),A&&(f?(A.style.display="flex",C&&(C.textContent=`Vereist: Stadion met ${c.reqCapacity}+ capaciteit`)):A.style.display="none"),I&&(f?(I.disabled=!0,I.textContent="Stadion te klein"):Z?(I.disabled=!1,I.textContent="Upgraden"):(I.disabled=!0,I.textContent="Te duur"))}}function Za(){const e=Nt,t=G[e];if(!t)return;const n=o.stadium[t.stateKey],i=t.levels.findIndex(s=>s.id===n),a=t.levels[i+1];if(!a){E("Maximaal niveau bereikt!","info");return}if(o.club.budget<a.cost){E("Niet genoeg budget!","error");return}if(a.reqCapacity&&(G.tribune.levels.find(r=>r.id===o.stadium.tribune)?.capacity||200)<a.reqCapacity){E(`Stadion te klein! Vereist ${a.reqCapacity}+ capaciteit.`,"error");return}o.club.budget-=a.cost,o.stadium[t.stateKey]=a.id,e==="tribune"&&a.capacity&&(o.stadium.capacity=a.capacity),qt(),Vt(e),R(),E(`${a.name} gebouwd!`,"success"),O()}function qt(){Object.entries(G).forEach(([t,n])=>{const i=o.stadium[n.stateKey],a=n.levels.findIndex(r=>r.id===i),s=document.getElementById(`cat-${t}-level`);s&&(s.textContent=`Nv.${a+1}`)});const e=document.getElementById("stadium-capacity");e&&(e.textContent=o.stadium.capacity||200)}function Xa(){qt(),jt("tribune")}window.selectStadiumCategory=jt;window.upgradeStadiumCategory=Za;document.addEventListener("DOMContentLoaded",da);console.log("🎮 Zaterdagvoetbal loaded via Vite!");
