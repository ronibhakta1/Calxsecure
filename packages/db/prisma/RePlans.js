"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed-live.ts
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var circles = [
    "Andhra Pradesh", "Assam", "Bihar & Jharkhand", "Chennai", "Delhi NCR",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Karnataka",
    "Kerala", "Kolkata", "Madhya Pradesh & Chhattisgarh", "Maharashtra & Goa",
    "Mumbai", "North East", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu",
    "Uttar Pradesh (East)", "Uttar Pradesh (West)", "West Bengal"
];
var jioPlans = [
    { amount: 149, validity: "28 days", desc: "1.5 GB/day + Unlimited Calls + 100 SMS/day" },
    { amount: 299, validity: "28 days", desc: "2 GB/day + Unlimited Calls + 100 SMS/day" },
    { amount: 349, validity: "28 days", desc: "2.5 GB/day + Unlimited Calls + JioHotstar" },
    { amount: 399, validity: "56 days", desc: "2 GB/day + Unlimited Calls + JioCinema" },
    { amount: 666, validity: "84 days", desc: "1.5 GB/day + Unlimited Calls + Disney+ Hotstar" },
    { amount: 899, validity: "84 days", desc: "2 GB/day + Unlimited Calls + JioHotstar 3-month" },
    { amount: 1199, validity: "84 days", desc: "3 GB/day + Unlimited Calls + Netflix" },
    { amount: 3599, validity: "365 days", desc: "2 GB/day + Unlimited Calls + Amazon Prime" },
    { amount: 3999, validity: "365 days", desc: "2.5 GB/day + Unlimited Calls + Netflix/Prime" },
];
var airtelPlans = [
    { amount: 199, validity: "28 days", desc: "1 GB/day + Unlimited Calls + Xstream Play" },
    { amount: 299, validity: "28 days", desc: "1.5 GB/day + Unlimited Calls + Disney+ Hotstar" },
    { amount: 379, validity: "30 days", desc: "2 GB/day + Unlimited Calls + Apollo 24|7" },
    { amount: 449, validity: "28 days", desc: "3 GB/day + Unlimited 5G + Amazon Prime" },
    { amount: 719, validity: "84 days", desc: "1.5 GB/day + Unlimited Calls + Hotstar" },
    { amount: 999, validity: "84 days", desc: "2.5 GB/day + Unlimited Calls + Netflix" },
    { amount: 2999, validity: "365 days", desc: "2 GB/day + Unlimited Calls + Disney+ Hotstar" },
    { amount: 3599, validity: "365 days", desc: "2.5 GB/day + Unlimited Calls + Netflix/Prime" },
];
var viPlans = [
    { amount: 99, validity: "28 days", desc: "₹99 Talktime + 200 MB + Night Data" },
    { amount: 179, validity: "28 days", desc: "1 GB/day + Unlimited Calls + Weekend Rollover" },
    { amount: 349, validity: "28 days", desc: "1.5 GB/day + Unlimited Calls + SonyLIV" },
    { amount: 449, validity: "28 days", desc: "3 GB/day + Unlimited Calls + Data Delights" },
    { amount: 996, validity: "84 days", desc: "2 GB/day + Unlimited Calls + SonyLIV Premium" },
    { amount: 1449, validity: "180 days", desc: "1.5 GB/day + Unlimited Calls + Hero Unlimited" },
    { amount: 3599, validity: "365 days", desc: "2 GB/day + Unlimited Calls + 16 OTTs" },
    { amount: 3799, validity: "365 days", desc: "2.5 GB/day + Unlimited Night Data + Amazon Prime" },
];
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var allPlans, _i, circles_1, circle, _a, jioPlans_1, p, _b, airtelPlans_1, p, _c, viPlans_1, p, payload;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, prisma.rechargePlan.deleteMany({})];
                case 1:
                    _d.sent();
                    allPlans = [];
                    for (_i = 0, circles_1 = circles; _i < circles_1.length; _i++) {
                        circle = circles_1[_i];
                        for (_a = 0, jioPlans_1 = jioPlans; _a < jioPlans_1.length; _a++) {
                            p = jioPlans_1[_a];
                            allPlans.push(__assign({ operator: "Jio", circle: circle }, p));
                        }
                        for (_b = 0, airtelPlans_1 = airtelPlans; _b < airtelPlans_1.length; _b++) {
                            p = airtelPlans_1[_b];
                            allPlans.push(__assign({ operator: "Airtel", circle: circle }, p));
                        }
                        for (_c = 0, viPlans_1 = viPlans; _c < viPlans_1.length; _c++) {
                            p = viPlans_1[_c];
                            allPlans.push(__assign({ operator: "Vi", circle: circle }, p));
                        }
                    }
                    payload = allPlans.map(function (p) { return (__assign(__assign({}, p), { planCode: "".concat(p.operator, "-").concat(p.amount, "-").concat(p.circle.slice(0, 3)).replace(/[^a-z0-9]/gi, '_'), planType: p.amount < 200 ? "TOPUP" : "DATA" })); });
                    return [4 /*yield*/, prisma.rechargePlan.createMany({
                            data: payload,
                            skipDuplicates: true,
                        })];
                case 2:
                    _d.sent();
                    console.log("\u2705 LIVE NOV 2025 DATA SEEDED");
                    console.log("   \uD83D\uDCF6 Circles: ".concat(circles.length));
                    console.log("   \uD83D\uDCF1 Plans  : ".concat(payload.length, " (Jio ").concat(jioPlans.length, " \u00D7 23, Airtel ").concat(airtelPlans.length, " \u00D7 23, Vi ").concat(viPlans.length, " \u00D7 23)"));
                    console.log("   \uD83D\uDE80 Run: npx tsx prisma/seed-live.ts");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (e) { throw e; }).finally(function () { return prisma.$disconnect(); });
