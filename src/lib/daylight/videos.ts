/* Real demonstrations through the creators’ official Vimeo players. No video files are downloaded or rehosted.
   Endpoint metadata checked 2026-10-08; playback is checked separately and never inferred from an HTTP response.
   Related variants are labelled; clinician/PDF prescriptions remain authoritative. */

export type VideoHost = "vimeo";

export type VideoEntry = {
  host: VideoHost;
  thumbnail?: string;
  matchNote?: string;
  id: string;
  title: string;
  author: string;
  authorUrl: string;
  /** seconds, from oEmbed */
  duration: number;
  /** native size from oEmbed, used for the frame's aspect ratio */
  width: number;
  height: number;
  match: "exact" | "close";
  verifiedAt: string;
  /** the player page itself was seen loading from the build box (see note above) */
  playerChecked: boolean;
  /** optional start offset in seconds */
  start?: number;
};

export const VERIFIED_AT = "2026-10-08";

export const VIDEO_LIBRARY = { host: "vimeo" as const, author: "Erin Stern", url: "https://vimeo.com/erinstern" };

const THUMBNAILS: Record<string, string> = {
  "472985316": "https://i.vimeocdn.com/video/983719814-5621e6a342517d335247c6e9e9f2c728d048e6017df2b1c5ad870c34e43fd06c-d_295x166?region=us",
  "382073937": "https://i.vimeocdn.com/video/843065296-01b3d80a23345b8f018d9f8264576d61c8081eed3a9c8bd33a479e7d7f0a45dc-d_295x166?region=us",
  "382082557": "https://i.vimeocdn.com/video/843077066-ee9d89103c8137f90e01bad8609bedba5796598d35d208e0049852f7f905275c-d_295x166?region=us",
  "1042343867": "https://i.vimeocdn.com/video/1965298274-26b55d44e3d072ca7d3c9ef8de1d8e8b3ee134dcd56018e405a4e27547a815f4-d_200x150?region=us",
  "382892058": "https://i.vimeocdn.com/video/844159770-fe2979261c06ea7a4580168a918a8ef8bbdfd039af50a4006e030b2cfe06849d-d_200x150?region=us",
  "344219307": "https://i.vimeocdn.com/video/793638060-21ff3aab75fb02538ef4f27a00e342a097dc0611aa6e3a021d5c7f0a1bc4ae89-d_295x166?region=us",
  "363548502": "https://i.vimeocdn.com/video/818731895-b906c36565cb52662e14be126953bb828e68845add0fb82369af660cac930fe5-d_295x166?region=us",
  "397466103": "https://i.vimeocdn.com/video/864679756-fbccc946659d00e9b34e42bf7edd9d85147c2d34ee132655a038facd4051ea9b-d_295x166?region=us",
  "388229309": "https://i.vimeocdn.com/video/851418867-3c25535342074e00cce31b46bea98d1b89aafcdadce54e9e8b9769264b45edd8-d_295x166?region=us",
  "1042343360": "https://i.vimeocdn.com/video/1965297681-29a5909c146491fe3fd7af2a73eab51044cc4295b0a57f2fb5307eddce29c739-d_200x150?region=us",
  "388228068": "https://i.vimeocdn.com/video/851417320-e1d1f6337641db0319a65249e7fd0b398555aa013809b3e1c63280967cb7f159-d_295x166?region=us",
  "393285873": "https://i.vimeocdn.com/video/858724420-75d6cd906366b10b5c93982bdf40794d7b43c34e5ecd78b266fad62d6ab283c7-d_295x166?region=us",
  "982699537": "https://i.vimeocdn.com/video/1898068767-aa68890323ddf2d49725e3b8fbb2bf23493a506422ecb14e70ab7a65a5e3ac7d-d_200x150?region=us",
  "683470013": "https://i.vimeocdn.com/video/1385580596-fcbf76482c89582a9045a74ef2e32658d6765fb1eda74120dab37b0a6087f538-d_200x150?region=us",
  "341669853": "https://i.vimeocdn.com/video/790348646-0f71a126adb9413659edf029638d25862bc16effdd0455fb55401cd7df9bb6ca-d_295x166?region=us",
  "393286049": "https://i.vimeocdn.com/video/858724727-44e8acd5cc72a46d3d7451de377b239da56a062732ddc5995597b6f8045a8fc1-d_295x166?region=us",
  "941687235": "https://i.vimeocdn.com/video/1844839939-8b7ac2944b32ebe0a1f15fa9fc3db0dbe47defcb38a6fe2d80ff658738225f53-d_200x150?region=us",
  "683469263": "https://i.vimeocdn.com/video/1385578256-d6d6a20b01ab7bf0905d6aeb15ac928271630eb81a7ac9784af918789a13cd36-d_200x150?region=us",
  "347319864": "https://i.vimeocdn.com/video/797614881-6c7c388829d4297794b546ff27cd429476c7a3a0a90c46e4e252289d470483c7-d_295x166?region=us",
  "1142414776": "https://i.vimeocdn.com/video/2090165262-95edc87cf0f02cacfc446a97efd399610f84616ea745f59c38709d2debc44ec8-d_200x150?region=us",
  "382073397": "https://i.vimeocdn.com/video/843064591-1fa162d822ffccefbb9010b564e55687f0012704a038d757bd4d816454f68ff7-d_295x166?region=us",
  "381715532": "https://i.vimeocdn.com/video/842560385-df208adbd4bfc956f9511fdfce8e2e6e819215a4d66404c30c3783540d34d1b3-d_200x150?region=us",
  "381693241": "https://i.vimeocdn.com/video/842531023-e289e6beec9db6b47be14219f5ee36b92abc8412bf0835ca35d28a71a682c084-d_295x166?region=us",
  "537000406": "https://i.vimeocdn.com/video/1111631377-4e315fd8724652aa8c32138f10818b08d444b094f339ae620989984342fb0b3e-d_295x166?region=us",
  "937917670": "https://i.vimeocdn.com/video/1838664906-711b1c92f05037e9a2e1d0ecab69a320e188281ae687520927758312bdbb6b7c-d_200x150?region=us",
  "1164665323": "https://i.vimeocdn.com/video/2121399369-10c3e66bd557e975c3e7b2f84b0195668b4faa3144b6631d80af99ac0b8ae772-d_200x150?region=us",
  "341669771": "https://i.vimeocdn.com/video/790348583-e0d505760fa88ed3d3157405448b575f2ea5d6d755595e920db62e98d1536b9c-d_295x166?region=us",
  "1042344101": "https://i.vimeocdn.com/video/1965298548-88e20a2596d925cb9311f4625a19cec81562f45d07a243dd241d94532765efa0-d_200x150?region=us",
  "342013944": "https://i.vimeocdn.com/video/790782150-e36dd3c532376ad770149364b753de2d1a2c95976a2b751d1e0920701fe35042-d_200x150?region=us",
  "382075041": "https://i.vimeocdn.com/video/843066655-fabc72c756a1d6b7a4a9f12ecb196c669bb2bec15ee149c1bcddc7a05d9aea19-d_295x166?region=us",
  "400928242": "https://i.vimeocdn.com/video/869489582-9a6abef7a37b0966a55a9b075b9c029b71c3c5f34b853b4c8febd495574fdd5e-d_295x166?region=us",
  "522365419": "https://i.vimeocdn.com/video/1081801812-36cc8f58477f09651d5ad3c1724423e367b237a71c0c2853c8e4608f503a6a9e-d_295x166?region=us",
  "939620596": "https://i.vimeocdn.com/video/1841550352-7effc5666b25bb00249a01d44f6092550478c5812c5621206523fcf6af5f966d-d_200x150?region=us",
  "394065041": "https://i.vimeocdn.com/video/859796254-5c8a5488bd5ff6b9e3f6416edec17341d539946d80cfec05b58f32a07cc03f06-d_295x166?region=us",
  "342271556": "https://i.vimeocdn.com/video/791109145-7b8e9d5e39b4e38340d588a59f52955f4c0f882ac0972bd9e7b011299715d8ce-d_200x150?region=us",
  "374270600": "https://i.vimeocdn.com/video/832663048-0fb1fa045b81170df96d9007386f58e7b297ed8cd77d192cdd7eba0fa8ed989e-d_295x166?region=us",
  "342015132": "https://i.vimeocdn.com/video/790784222-ae01c60e8dad7c4dc44e9d1028645386a2a5380f861237390d7ee8e6b7845bb4-d_295x166?region=us",
  "943676055": "https://i.vimeocdn.com/video/1847962314-5cec29f982b3724729aec499a5ecfc8e1bcc91ecb188398fe53ed79b099885cd-d_200x150?region=us",
  "943677306": "https://i.vimeocdn.com/video/1847964003-fa02368c63723736547bbc37f79b4bf32c73bf14c6fe1ae5aefb90a82b432cce-d_200x150?region=us",
  "441077323": "https://i.vimeocdn.com/video/928961733-b16b6fd6507ff8846e9ad2df71d25f55fb8b7f44a6d201db32572f5a645fd207-d_295x166?region=us",
  "394065217": "https://i.vimeocdn.com/video/859796265-bd05b39f5090a89952b14344940c27baebd268447b8f73326efe651b274be4c0-d_295x166?region=us",
  "666343493": "https://i.vimeocdn.com/video/1348968725-405aa8f04b1a9dea6f30f9a2d03f57287c6241948bff7c4205b2afd5f6f80e40-d_295x166?region=us",
  "342626247": "https://i.vimeocdn.com/video/791551782-bcd9811a3ec709e090fa449543d3a2362e6f951db40fea48713191d6c6dab99c-d_200x150?region=us",
  "388229474": "https://i.vimeocdn.com/video/851418957-e1e3297bb68b461c45962f592cb4aa0a1c50ed4030538f42833d40c1ea3e4657-d_295x166?region=us",
  "386067508": "https://i.vimeocdn.com/video/848453240-25aba22b7e6d595b5268ed507194022e6114674f3967bd776865fa1cfc484dd8-d_295x166?region=us",
  "949268043": "https://i.vimeocdn.com/video/1857003587-c4781d1fe32b29bd19e32f9eba8f8cd1378c4f15d1da6bfe3b3c978f68bde8d0-d_200x150?region=us",
  "472608975": "https://i.vimeocdn.com/video/983071375-fb26c15fd1df7b2bc03446651c4c161664793cd2f1379a0e5a10e4cc8371bd3e-d_295x166?region=us",
  "497051978": "https://i.vimeocdn.com/video/1028636590-68befcc042ff09897f8abfc1c76784f6e34fbbdf320afe87443b56ea64619626-d_295x166?region=us",
  "391501964": "https://i.vimeocdn.com/video/856161279-b57a1eb6b7970e7fa6a653f93b7b634b1c01f686e181986ad2f2d8dedd26dea9-d_295x166?region=us",
  "513051858": "https://i.vimeocdn.com/video/1062282825-e6c21bc0fb7b2d8c251c453bc0d324c6787c1b3c576bace6735b5f6283b0ad89-d_295x166?region=us",
  "513047635": "https://i.vimeocdn.com/video/1062275221-ffc55236398817a96a14192d20d4c41977313ac3470dc5612516c1c66e5b27f4-d_295x166?region=us",
  "344218224": "https://i.vimeocdn.com/video/793636680-a5794475ffa82cc9bae146fac916d4d85a7cf65c344e44713d888a6d4a5d89a0-d_295x166?region=us",
  "388227392": "https://i.vimeocdn.com/video/851416581-39469dd96cfa559ece9c5173c602c07070cc22070a0652eb6577fbf41a1b6664-d_295x166?region=us",
  "441078130": "https://i.vimeocdn.com/video/928963241-e725c4794446d94a8e5452382cb4166c88453f6de185f34fb95d797f67e789c0-d_295x166?region=us",
  "512608356": "https://i.vimeocdn.com/video/1061374673-b4e854eb5e30e761b11751b17f5d0b52d2946cbafd4ab517c4228f9864e46b77-d_295x166?region=us",
  "683465388": "https://i.vimeocdn.com/video/1385568668-5e2af471c88ca63b792de5001f79b09da94f84928e5391bf1fd091572b877fc9-d_200x150?region=us",
  "1141626909": "https://i.vimeocdn.com/video/2089085812-3893f256f11ada2965f1c7190647a4fbdcfed2d9f459a9e57c03b93206498f83-d_200x150?region=us",
  "497052707": "https://i.vimeocdn.com/video/1028638558-15c79ed435c21ba9600eede9ecaac402544fe6c1d534009c737ea6ac3aa9bfc3-d_295x166?region=us",
  "393286127": "https://i.vimeocdn.com/video/870913018-186f649d3b4c514ab234331c78cbdf8bc36f74609a925b59f08c67b82e76a39f-d_295x166?region=us",
  "397863107": "https://i.vimeocdn.com/video/865260475-408677a3cdd6ad6687ba618264c8608d71d3fff65382a9e096a19720c1c0e390-d_200x150?region=us",
  "493483617": "https://i.vimeocdn.com/video/1020473106-f6860ec6a25efdff0ed04e56afe00fbe1808258582ff738dc3cae8c13ff5b568-d_295x166?region=us",
  "683467884": "https://i.vimeocdn.com/video/1385575159-9514b5aa4349e81978976980c928efbce7ab977efdcf0a880f73f0bb4446c3f4-d_200x150?region=us",
  "382086323": "https://i.vimeocdn.com/video/843081867-ccc66eef879c16e4ebf94337d96f060d2da6e38cdd10e418872c78579fadec2c-d_200x150?region=us",
  "499280692": "https://i.vimeocdn.com/video/1033234103-009ffa3cdaa649d7c839feb5361f427c6a465ab73e4bfee182ded3353a965944-d_295x166?region=us",
  "393284377": "https://i.vimeocdn.com/video/858722314-c1f38828aeccdc84358b5341b4c2e327ec6b03c1a25e8e006d0f479db0ce4e3a-d_295x166?region=us",
  "453350047": "https://i.vimeocdn.com/video/949595104-6c459bcb90d9bef739fa6cec3ad34f3d371af7b2625517789b044b202dba4fde-d_295x166?region=us"
};

const v = (id: string, title: string, duration: number, width: number, height: number, match: "exact" | "close", playerChecked: boolean): VideoEntry => ({
  host: "vimeo",
  thumbnail: THUMBNAILS[id],
  id,
  title,
  author: VIDEO_LIBRARY.author,
  authorUrl: VIDEO_LIBRARY.url,
  duration,
  width,
  height,
  match,
  verifiedAt: VERIFIED_AT,
  playerChecked,
});

export const VIDEOS: Record<string, VideoEntry> = {
  "cross-body-cable-ext": {"host": "vimeo", "id": "604696583", "title": "Cross-body Tricep Extension", "author": "George Rudd", "authorUrl": "https://vimeo.com/georgeruddfitness", "duration": 31, "width": 426, "height": 240, "match": "close", "playerChecked": true, "thumbnail": "https://i.vimeocdn.com/video/1241078670-1ab55f616dd238aa725d8d7bff1c2d8ca0adab6b2664b3bea0a7ee282f61f794-d_295x166?region=us", "matchNote": "Shows a single-cable, one-arm version. Check the handle height and stance against your plan.", "verifiedAt": VERIFIED_AT},

  "dead-bug": v("472985316", "Dead bugs", 15, 426, 240, "exact", true),
  "clamshell": v("382073937", "Side lying clam", 12, 426, 240, "exact", true),
  "band-walks": v("382082557", "Banded side steps", 15, 426, 240, "exact", true),
  "plank": v("1042343867", "Plank", 36, 240, 300, "exact", false),
  "pallof": v("382892058", "Palloff press", 22, 240, 240, "exact", true),
  "neutral-pullup": v("344219307", "Pull Ups - Neutral Grip", 27, 426, 240, "exact", true),
  "chest-supported-row": v("363548502", "Supine Rows - Dumbbell", 29, 426, 240, "close", true),
  "half-kneeling-pulldown": v("397466103", "Single-Arm Pulldown", 14, 426, 240, "close", true),
  "face-pull": v("388229309", "Face Pulls", 22, 426, 240, "exact", true),
  "straight-arm-pulldown": v("1042343360", "Rope straight arm pushdowns", 37, 240, 300, "exact", false),
  "reverse-crunch": v("388228068", "Reverse Crunches", 6, 426, 240, "exact", true),
  "cable-crunch": v("393285873", "Cable crunches", 12, 426, 240, "exact", true),
  "hack-squat": v("982699537", "Hack squat machine", 65, 240, 300, "exact", false),
  "heel-elevated-goblet": v("683470013", "Heel-elevated goblet squat", 12, 240, 320, "exact", true),
  "bulgarian-split-squat": v("341669853", "Bulgarian Split Squats", 40, 426, 240, "exact", true),
  "leg-press": v("393286049", "Machine leg press", 11, 426, 240, "exact", true),
  "leg-extension": v("941687235", "Leg extensions", 52, 240, 300, "exact", false),
  "standing-calf-raise": v("683469263", "Standing dumbbell calf raise", 12, 240, 320, "exact", true),
  "incline-db-press": v("347319864", "Dumbbell incline bench press", 30, 426, 240, "exact", true),
  "landmine-press": v("1142414776", "Kneeling landmine shoulder press", 21, 240, 300, "close", false),
  "weighted-pushup": v("382073397", "Push ups", 15, 426, 240, "close", true),
  "low-high-fly": v("381715532", "Cable incline flyes", 40, 240, 240, "close", true),
  "cable-lateral-raise": v("381693241", "Lateral raise - cable", 45, 426, 240, "exact", true),
  "overhead-rope-triceps": v("537000406", "Cable overhead triceps extension", 13, 426, 240, "exact", true),
  "hip-thrust": v("937917670", "Barbell hip thrust", 54, 240, 300, "exact", false),
  "machine-hip-thrust": v("1164665323", "Hip thrust machine", 29, 240, 300, "exact", false),
  "bstance-rdl": v("341669771", "B-Stance RDLs", 51, 426, 240, "exact", true),
  "leg-curl": v("1042344101", "Seated leg curl", 42, 240, 300, "exact", false),
  "lying-leg-curl": v("342013944", "Lying leg curl", 31, 240, 240, "exact", true),
  "reverse-lunge": v("382075041", "Reverse lunges", 12, 426, 240, "exact", true),
  "box-step-up": v("400928242", "Weighted Step Ups", 11, 426, 240, "exact", true),
  "back-extension-45": v("522365419", "45 degree back hyper (toes out)", 11, 426, 240, "exact", true),
  "cable-hip-abduction": v("939620596", "Glute medius leg lifts - cable", 61, 240, 300, "exact", false),
  "seated-calf-raise": v("394065041", "Seated calf raise machine", 15, 426, 240, "exact", true),
  "shoulder-press": v("342271556", "Seated dumbbell shoulder press", 27, 240, 240, "exact", true),
  "reverse-pec-deck": v("374270600", "Reverse flyes on pec deck", 25, 426, 240, "exact", true),
  "y-raise": v("342015132", "Y-Raise", 21, 426, 240, "exact", true),
  "incline-db-curl": v("943676055", "Incline curls", 29, 240, 300, "exact", false),
  "rope-pressdown": v("943677306", "Triceps push downs", 30, 240, 300, "exact", false),
  "farmer-carry": v("441077323", "Farmer’s carries", 5, 426, 240, "exact", true),
  "adductor-machine": v("394065217", "Adductor Machine", 14, 426, 240, "exact", true),
  "sumo-goblet": v("666343493", "Dumbbell sumo squat", 13, 320, 240, "close", true),
  "high-low-fly": v("342626247", "Decline Flyes - Cable", 28, 240, 240, "close", true),
  "hammer-curl": v("388229474", "Hammer Curls", 16, 426, 240, "exact", true),
  "band-pull-apart": v("386067508", "Band pull aparts", 10, 426, 240, "exact", true),
  "lat-pulldown": v("949268043", "Wide grip lat pulldown", 33, 240, 300, "exact", false),
  "seated-cable-row": v("472608975", "Cable low row", 9, 426, 240, "exact", true),
  "side-plank": v("497051978", "Side plank", 5, 426, 240, "exact", true),
  "hanging-knee-raise": v("391501964", "Hanging Knee Raises", 23, 426, 240, "close", true),
  "cable-woodchop": v("513051858", "Wood chopper low to high", 8, 426, 240, "exact", true),
  "glute-bridge": v("513047635", "Body weight glute bridge", 7, 426, 240, "exact", true),
  "cable-pull-through": v("344218224", "Pull Throughs", 34, 426, 240, "exact", true),
  "sl-glute-bridge": v("388227392", "Glute Bridge - Single-leg", 14, 426, 240, "exact", true),
  "ball-leg-curl": v("441078130", "Swiss ball leg curls", 10, 426, 240, "exact", true),
  "nordic-curl": v("512608356", "Nordic curl - toes under machine", 21, 426, 240, "exact", true),
  "leg-press-narrow": v("683465388", "Narrow stance leg press", 8, 240, 320, "exact", true),
  "assisted-dip": v("1141626909", "Dips", 19, 240, 300, "close", false),
  "sl-calf-raise-press": v("393286127", "Calf raise on leg press", 8, 426, 240, "close", true),
  "skull-crusher": v("397863107", "Skullcrushers - EZ Bar", 9, 240, 426, "exact", true),
  "close-grip-pushup": v("493483617", "Kettlebell close grip push-ups", 9, 426, 240, "close", true),
  "preacher-curl": v("683467884", "Preacher curls on cable row machine", 11, 240, 320, "close", true),
  "cable-front-raise": v("382086323", "Front raise - cable", 21, 240, 240, "exact", true),
  "chest-supported-rear-fly": v("499280692", "Incline rear delt raise", 18, 426, 240, "exact", true),
  "side-lying-abduction": v("393284377", "Lying abductor leg lift", 8, 426, 240, "exact", true),
  "pushup": v("382073397", "Push ups", 15, 426, 240, "exact", true),
  "reverse-hyper-light": v("453350047", "Reverse hypers", 23, 426, 240, "exact", true),

  "ppt": {"host": "vimeo", "id": "397719849", "title": "Posterior Pelvic Tilt Video", "author": "Hip Pain Help", "authorUrl": "https://vimeo.com/hippainhelp", "duration": 14, "width": 240, "height": 240, "match": "exact", "playerChecked": false, "thumbnail": "https://i.vimeocdn.com/video/865048469-b3ccbcf12c4059efbea20ae7328aee4d39eedfd2b5d43363c3aa9eef2ccdcfb4-d_200x150?region=us", "verifiedAt": VERIFIED_AT},
  "pt-shoulder-flexion": {"host": "vimeo", "id": "397719849", "title": "Posterior Pelvic Tilt Video", "author": "Hip Pain Help", "authorUrl": "https://vimeo.com/hippainhelp", "duration": 14, "width": 240, "height": 240, "match": "close", "playerChecked": false, "thumbnail": "https://i.vimeocdn.com/video/865048469-b3ccbcf12c4059efbea20ae7328aee4d39eedfd2b5d43363c3aa9eef2ccdcfb4-d_200x150?region=us", "matchNote": "Shows the pelvic tilt only. Your PDF adds a shoulder-flexion hold; that combined movement is not demonstrated here.", "verifiedAt": VERIFIED_AT},
  "bird-dog": {"host": "vimeo", "id": "1113711375", "title": "Bird Dog", "author": "Justin Brink", "authorUrl": "https://vimeo.com/user230832661", "duration": 48, "width": 426, "height": 240, "match": "exact", "playerChecked": false, "thumbnail": "https://i.vimeocdn.com/video/2177804734-639aa0073b85f079eb166b95c21d4258da44dcb05bedaca1da5dd6804fde085d-d_295x166?region=us", "verifiedAt": VERIFIED_AT},
  "bird-dog-hold": {"host": "vimeo", "id": "1077244849", "title": "Bird-Dog with Isometric Hold", "author": "T C", "authorUrl": "https://vimeo.com/user228346924", "duration": 16, "width": 426, "height": 240, "match": "exact", "playerChecked": false, "thumbnail": "https://i.vimeocdn.com/video/2007230845-27775436c8dd615835700e12481b5f05843260d99ec09b5a009fb55044e7da25-d_295x166?region=us", "verifiedAt": VERIFIED_AT},
  "bracing-marches": {"host": "vimeo", "id": "1078481512", "title": "Supine March with pelvic tilt", "author": "Amanda", "authorUrl": "https://vimeo.com/user213497696", "duration": 15, "width": 240, "height": 426, "match": "close", "playerChecked": false, "thumbnail": "https://i.vimeocdn.com/video/2008719796-3fcf858efa7ec798227676a5d21d6783e204bab1dfbf4dcc666ac73f24ab24be-d_200x150?region=us", "matchNote": "Demonstrates supine marching with a pelvic tilt. Your plan specifies abdominal bracing; follow your plan’s cues.", "verifiedAt": VERIFIED_AT},
  "single-leg-stand": {"host": "vimeo", "id": "1121632621", "title": "Single Leg Balance Drill", "author": "Spacer Mobility", "authorUrl": "https://vimeo.com/user246491072", "duration": 33, "width": 426, "height": 240, "match": "exact", "playerChecked": false, "thumbnail": "https://i.vimeocdn.com/video/2062739043-bbd51ecb043919df8b006b0e09fdb140f9af43d9def94ae4a009547db9447341-d_295x166?region=us", "verifiedAt": VERIFIED_AT},
  "seated-pigeon": {"host": "vimeo", "id": "212698317", "title": "Seated Figure 4 Piriformis Stretch", "author": "Keet Health", "authorUrl": "https://vimeo.com/user25127782", "duration": 18, "width": 640, "height": 360, "match": "exact", "playerChecked": false, "thumbnail": "https://i.vimeocdn.com/video/629138424-6363a879c10dbc2c0dd65112bfc8b7422d574833227ac51fdc9b12d56b705ffa-d_640?region=us", "verifiedAt": VERIFIED_AT},
  "suitcase-carry": {"host": "vimeo", "id": "106488639", "title": "HPI Strength and Conditioning- Suitcase Carry Exercise Description", "author": "Human Performance Initiative", "authorUrl": "https://vimeo.com/user24707770", "duration": 19, "width": 640, "height": 360, "match": "exact", "playerChecked": true, "thumbnail": "https://i.vimeocdn.com/video/489622082-ea33f02090a58ed361012f8670cb33e52c2a63dedee9c1608c1ea1081347f39f-d_640?region=us", "verifiedAt": VERIFIED_AT},
  "tibialis-raise": {"host": "vimeo", "id": "1143165855", "title": "Wall-Assisted Tibialis Anterior Raise | Shin Strength, Ankle Control & Foot Mechanics", "author": "Justin Brink", "authorUrl": "https://vimeo.com/user230832661", "duration": 12, "width": 426, "height": 240, "match": "exact", "playerChecked": false, "thumbnail": "https://i.vimeocdn.com/video/2097845837-0db9408709777653807ccd4e89af5d9d0fd8e80c668dd9dd872678a07bfb69d8-d_295x166?region=us", "verifiedAt": VERIFIED_AT},
  "incline-shrug": {"host": "vimeo", "id": "1143449724", "title": "Dumbbell Incline Shrug", "author": "Art Rothafel", "authorUrl": "https://vimeo.com/user1039930", "duration": 3, "width": 426, "height": 240, "match": "exact", "playerChecked": false, "thumbnail": "https://i.vimeocdn.com/video/2091644572-1b636f19b8fb0ab00d06da8039e53653345bf989fab837c819aecbbd5a71ec9d-d_295x166?region=us", "verifiedAt": VERIFIED_AT},
  "btb-lateral-raise": {"host": "vimeo", "id": "1138241062", "title": "Cable Lateral Raise (Behind The Back)", "author": "Adam Griffith", "authorUrl": "https://vimeo.com/user250013380", "duration": 20, "width": 426, "height": 240, "match": "exact", "playerChecked": false, "thumbnail": "https://i.vimeocdn.com/video/2084512990-eb8bb6100425f57330b45a5017e3bd6933dac867936a3c224d1ad776b7540962-d_295x166?region=us", "verifiedAt": VERIFIED_AT},
  "wall-sit": {"host": "vimeo", "id": "430606448", "title": "Body Weight Exercises - Wall Sit", "author": "Wright Physical Therapy", "authorUrl": "https://vimeo.com/wrightphysicaltherapy", "duration": 71, "width": 426, "height": 240, "match": "exact", "playerChecked": false, "thumbnail": "https://i.vimeocdn.com/video/911298867-9c4f29dee22fe5b12f83f6d9e6892f9d277da19be4fd9d119e49c24ad62c8fdc-d_295x166?region=us", "verifiedAt": VERIFIED_AT},
  "dead-hang": {"host": "vimeo", "id": "661412612", "title": "Dead Hang", "author": "Ryan Callicott", "authorUrl": "https://vimeo.com/user162111961", "duration": 30, "width": 240, "height": 426, "match": "exact", "playerChecked": false, "thumbnail": "https://i.vimeocdn.com/video/1337387653-c43251161b0ae8ff58e0cbdcae459e13c2f815e1ad3bef9cd0cd33960594d1ed-d_200x150?region=us", "verifiedAt": VERIFIED_AT},
  "machine-lateral-raise": {"host": "vimeo", "id": "447422969", "title": "Machine Lateral Raise", "author": "David Kingsbury", "authorUrl": "https://vimeo.com/davidkingsbury", "duration": 8, "width": 426, "height": 240, "match": "exact", "playerChecked": false, "thumbnail": "https://i.vimeocdn.com/video/939634954-a7764a5ba8560bbddc3160659680e8a18d1e4bd19602495d3d1b55d330d0911a-d_295x166?region=us", "verifiedAt": VERIFIED_AT},
  "battle-rope-squat": {"host": "vimeo", "id": "706946382", "title": "EID1407 - Battle Ropes Squat Waves", "author": "L33", "authorUrl": "https://vimeo.com/user73835710", "duration": 11, "width": 426, "height": 240, "match": "exact", "playerChecked": false, "thumbnail": "https://i.vimeocdn.com/video/1426863796-67db533b3502c86d5b75ca23420712b65ac8d8e29bcc913848e5aac4930ce912-d_295x166?region=us", "verifiedAt": VERIFIED_AT},
};

/** Moves with no clip, and why. Real photographs are used where available; otherwise written cues remain visible. */
export const NO_VIDEO: Record<string, string> = {
  "mobility-flow": "A multi-move warm-up flow, not one movement; no single clip fits.",
  "zone2": "Steady cardio block (any machine), not a lift; no clip needed.",
  "tuesday-cardio": "Cardio block, not a lift; no clip needed.",
  "wednesday-cardio": "Cardio block, not a lift; no clip needed.",
  "saturday-cardio": "Cardio block, not a lift; no clip needed.",
  "assisted-pullup": "No assisted pull-up machine clip in the library; real photos available.",
  "machine-chest-press": "No seated machine chest press clip found in the library; real photos available.",
  "machine-shoulder-press": "No machine shoulder press clip in the library; real photos available.",
  "ez-curl": "No EZ-bar curl clip found in the library; real photos available.",
  "pec-deck": "No forward pec-deck fly clip found in the library; real photos available.",
  "incline-machine-press": "Library clip found was a plate-press (holding a weight plate), not the machine; real photos available.",
  "wrist-curl": "No wrist curl clip in the library; real photos available.",
  "cable-external-rotation": "Library external-rotation clip was ambiguous about setup; real photos available.",
  "tbar-chest-supported": "Library T-bar clip is a landmine row, not chest-supported; real photos available.",
  "cable-shrug": "No cable shrug clip in the library; real photos available.",
};

export function videoFor(exerciseId: string): VideoEntry | undefined {
  return VIDEOS[exerciseId];
}

export function isVimeoId(id: string): boolean {
  return /^\d{6,12}$/.test(id);
}

/** The only embed URL the app builds: Vimeo's official player, muted autoplay loop, inline, Do Not Track. */
export function vimeoEmbedUrl(v: Pick<VideoEntry, "id" | "start">): string {
  const base = `https://player.vimeo.com/video/${v.id}?autoplay=1&muted=1&loop=1&playsinline=1&title=0&byline=0&portrait=0&dnt=1`;
  return v.start ? `${base}#t=${Math.max(0, Math.round(v.start))}s` : base;
}

export function vimeoPageUrl(id: string): string {
  return `https://vimeo.com/${id}`;
}

export function videoCredit(v: Pick<VideoEntry, "title" | "author">): string {
  return `Video: ${v.title} by ${v.author} on Vimeo`;
}
