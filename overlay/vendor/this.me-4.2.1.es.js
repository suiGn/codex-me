var Xo = (e) => {
  throw TypeError(e);
};
var Yo = (e, t, n) => t.has(e) || Xo("Cannot " + n);
var H = (e, t, n) => (Yo(e, t, "read from private field"), n ? n.call(e) : t.get(e)), bn = (e, t, n) => t.has(e) ? Xo("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), te = (e, t, n, r) => (Yo(e, t, "write to private field"), r ? r.call(e, n) : t.set(e, n), n);
var vc = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Sc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var ar = { exports: {} };
var Zo;
function wc() {
  return Zo || (Zo = 1, (function(e) {
    (function() {
      var t = "input is invalid type", n = "finalize already called", r = typeof window == "object", o = r ? window : {};
      o.JS_SHA3_NO_WINDOW && (r = !1);
      var i = !r && typeof self == "object", a = !o.JS_SHA3_NO_NODE_JS && typeof process == "object" && process.versions && process.versions.node;
      a ? o = vc : i && (o = self);
      for (var s = !o.JS_SHA3_NO_COMMON_JS && !0 && e.exports, c = !o.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer < "u", u = "0123456789abcdef".split(""), f = [31, 7936, 2031616, 520093696], d = [4, 1024, 262144, 67108864], h = [1, 256, 65536, 16777216], p = [6, 1536, 393216, 100663296], y = [0, 8, 16, 24], S = [
        1,
        0,
        32898,
        0,
        32906,
        2147483648,
        2147516416,
        2147483648,
        32907,
        0,
        2147483649,
        0,
        2147516545,
        2147483648,
        32777,
        2147483648,
        138,
        0,
        136,
        0,
        2147516425,
        0,
        2147483658,
        0,
        2147516555,
        0,
        139,
        2147483648,
        32905,
        2147483648,
        32771,
        2147483648,
        32770,
        2147483648,
        128,
        2147483648,
        32778,
        0,
        2147483658,
        2147483648,
        2147516545,
        2147483648,
        32896,
        2147483648,
        2147483649,
        0,
        2147516424,
        2147483648
      ], g = [224, 256, 384, 512], b = [128, 256], A = ["hex", "buffer", "arrayBuffer", "array", "digest"], m = {
        128: 168,
        256: 136
      }, x = o.JS_SHA3_NO_NODE_JS || !Array.isArray ? function(l) {
        return Object.prototype.toString.call(l) === "[object Array]";
      } : Array.isArray, E = c && (o.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView) ? function(l) {
        return typeof l == "object" && l.buffer && l.buffer.constructor === ArrayBuffer;
      } : ArrayBuffer.isView, C = function(l) {
        var v = typeof l;
        if (v === "string")
          return [l, !0];
        if (v !== "object" || l === null)
          throw new Error(t);
        if (c && l.constructor === ArrayBuffer)
          return [new Uint8Array(l), !1];
        if (!x(l) && !E(l))
          throw new Error(t);
        return [l, !1];
      }, D = function(l) {
        return C(l)[0].length === 0;
      }, R = function(l) {
        for (var v = [], w = 0; w < l.length; ++w)
          v[w] = l[w];
        return v;
      }, V = function(l, v, w) {
        return function(k) {
          return new $(l, v, l).update(k)[w]();
        };
      }, q = function(l, v, w) {
        return function(k, M) {
          return new $(l, v, M).update(k)[w]();
        };
      }, Ke = function(l, v, w) {
        return function(k, M, B, I) {
          return ge["cshake" + l].update(k, M, B, I)[w]();
        };
      }, Ve = function(l, v, w) {
        return function(k, M, B, I) {
          return ge["kmac" + l].update(k, M, B, I)[w]();
        };
      }, O = function(l, v, w, k) {
        for (var M = 0; M < A.length; ++M) {
          var B = A[M];
          l[B] = v(w, k, B);
        }
        return l;
      }, qo = function(l, v) {
        var w = V(l, v, "hex");
        return w.create = function() {
          return new $(l, v, l);
        }, w.update = function(k) {
          return w.create().update(k);
        }, O(w, V, l, v);
      }, gc = function(l, v) {
        var w = q(l, v, "hex");
        return w.create = function(k) {
          return new $(l, v, k);
        }, w.update = function(k, M) {
          return w.create(M).update(k);
        }, O(w, q, l, v);
      }, bc = function(l, v) {
        var w = m[l], k = Ke(l, v, "hex");
        return k.create = function(M, B, I) {
          return D(B) && D(I) ? ge["shake" + l].create(M) : new $(l, v, M).bytepad([B, I], w);
        }, k.update = function(M, B, I, _) {
          return k.create(B, I, _).update(M);
        }, O(k, Ke, l, v);
      }, xc = function(l, v) {
        var w = m[l], k = Ve(l, v, "hex");
        return k.create = function(M, B, I) {
          return new ir(l, v, B).bytepad(["KMAC", I], w).bytepad([M], w);
        }, k.update = function(M, B, I, _) {
          return k.create(M, I, _).update(B);
        }, O(k, Ve, l, v);
      }, Go = [
        { name: "keccak", padding: h, bits: g, createMethod: qo },
        { name: "sha3", padding: p, bits: g, createMethod: qo },
        { name: "shake", padding: f, bits: b, createMethod: gc },
        { name: "cshake", padding: d, bits: b, createMethod: bc },
        { name: "kmac", padding: d, bits: b, createMethod: xc }
      ], ge = {}, Qe = [], be = 0; be < Go.length; ++be)
        for (var Fe = Go[be], gt = Fe.bits, et = 0; et < gt.length; ++et) {
          var or = Fe.name + "_" + gt[et];
          if (Qe.push(or), ge[or] = Fe.createMethod(gt[et], Fe.padding), Fe.name !== "sha3") {
            var Jo = Fe.name + gt[et];
            Qe.push(Jo), ge[Jo] = ge[or];
          }
        }
      function $(l, v, w) {
        this.blocks = [], this.s = [], this.padding = v, this.outputBits = w, this.reset = !0, this.finalized = !1, this.block = 0, this.start = 0, this.blockCount = 1600 - (l << 1) >> 5, this.byteCount = this.blockCount << 2, this.outputBlocks = w >> 5, this.extraBytes = (w & 31) >> 3;
        for (var k = 0; k < 50; ++k)
          this.s[k] = 0;
      }
      $.prototype.update = function(l) {
        if (this.finalized)
          throw new Error(n);
        var v = C(l);
        l = v[0];
        for (var w = v[1], k = this.blocks, M = this.byteCount, B = l.length, I = this.blockCount, _ = 0, z = this.s, P, T; _ < B; ) {
          if (this.reset)
            for (this.reset = !1, k[0] = this.block, P = 1; P < I + 1; ++P)
              k[P] = 0;
          if (w)
            for (P = this.start; _ < B && P < M; ++_)
              T = l.charCodeAt(_), T < 128 ? k[P >> 2] |= T << y[P++ & 3] : T < 2048 ? (k[P >> 2] |= (192 | T >> 6) << y[P++ & 3], k[P >> 2] |= (128 | T & 63) << y[P++ & 3]) : T < 55296 || T >= 57344 ? (k[P >> 2] |= (224 | T >> 12) << y[P++ & 3], k[P >> 2] |= (128 | T >> 6 & 63) << y[P++ & 3], k[P >> 2] |= (128 | T & 63) << y[P++ & 3]) : (T = 65536 + ((T & 1023) << 10 | l.charCodeAt(++_) & 1023), k[P >> 2] |= (240 | T >> 18) << y[P++ & 3], k[P >> 2] |= (128 | T >> 12 & 63) << y[P++ & 3], k[P >> 2] |= (128 | T >> 6 & 63) << y[P++ & 3], k[P >> 2] |= (128 | T & 63) << y[P++ & 3]);
          else
            for (P = this.start; _ < B && P < M; ++_)
              k[P >> 2] |= l[_] << y[P++ & 3];
          if (this.lastByteIndex = P, P >= M) {
            for (this.start = P - M, this.block = k[I], P = 0; P < I; ++P)
              z[P] ^= k[P];
            tt(z), this.reset = !0;
          } else
            this.start = P;
        }
        return this;
      }, $.prototype.encode = function(l, v) {
        var w = l & 255, k = 1, M = [w];
        for (l = l >> 8, w = l & 255; w > 0; )
          M.unshift(w), l = l >> 8, w = l & 255, ++k;
        return v ? M.push(k) : M.unshift(k), this.update(M), M.length;
      }, $.prototype.encodeString = function(l) {
        var v = C(l);
        l = v[0];
        var w = v[1], k = 0, M = l.length;
        if (w)
          for (var B = 0; B < l.length; ++B) {
            var I = l.charCodeAt(B);
            I < 128 ? k += 1 : I < 2048 ? k += 2 : I < 55296 || I >= 57344 ? k += 3 : (I = 65536 + ((I & 1023) << 10 | l.charCodeAt(++B) & 1023), k += 4);
          }
        else
          k = M;
        return k += this.encode(k * 8), this.update(l), k;
      }, $.prototype.bytepad = function(l, v) {
        for (var w = this.encode(v), k = 0; k < l.length; ++k)
          w += this.encodeString(l[k]);
        var M = (v - w % v) % v, B = [];
        return B.length = M, this.update(B), this;
      }, $.prototype.finalize = function() {
        if (!this.finalized) {
          this.finalized = !0;
          var l = this.blocks, v = this.lastByteIndex, w = this.blockCount, k = this.s;
          if (l[v >> 2] |= this.padding[v & 3], this.lastByteIndex === this.byteCount)
            for (l[0] = l[w], v = 1; v < w + 1; ++v)
              l[v] = 0;
          for (l[w - 1] |= 2147483648, v = 0; v < w; ++v)
            k[v] ^= l[v];
          tt(k);
        }
      }, $.prototype.toString = $.prototype.hex = function() {
        this.finalize();
        for (var l = this.blockCount, v = this.s, w = this.outputBlocks, k = this.extraBytes, M = 0, B = 0, I = "", _; B < w; ) {
          for (M = 0; M < l && B < w; ++M, ++B)
            _ = v[M], I += u[_ >> 4 & 15] + u[_ & 15] + u[_ >> 12 & 15] + u[_ >> 8 & 15] + u[_ >> 20 & 15] + u[_ >> 16 & 15] + u[_ >> 28 & 15] + u[_ >> 24 & 15];
          B % l === 0 && (v = R(v), tt(v), M = 0);
        }
        return k && (_ = v[M], I += u[_ >> 4 & 15] + u[_ & 15], k > 1 && (I += u[_ >> 12 & 15] + u[_ >> 8 & 15]), k > 2 && (I += u[_ >> 20 & 15] + u[_ >> 16 & 15])), I;
      }, $.prototype.arrayBuffer = function() {
        this.finalize();
        var l = this.blockCount, v = this.s, w = this.outputBlocks, k = this.extraBytes, M = 0, B = 0, I = this.outputBits >> 3, _;
        k ? _ = new ArrayBuffer(w + 1 << 2) : _ = new ArrayBuffer(I);
        for (var z = new Uint32Array(_); B < w; ) {
          for (M = 0; M < l && B < w; ++M, ++B)
            z[B] = v[M];
          B % l === 0 && (v = R(v), tt(v));
        }
        return k && (z[B] = v[M], _ = _.slice(0, I)), _;
      }, $.prototype.buffer = $.prototype.arrayBuffer, $.prototype.digest = $.prototype.array = function() {
        this.finalize();
        for (var l = this.blockCount, v = this.s, w = this.outputBlocks, k = this.extraBytes, M = 0, B = 0, I = [], _, z; B < w; ) {
          for (M = 0; M < l && B < w; ++M, ++B)
            _ = B << 2, z = v[M], I[_] = z & 255, I[_ + 1] = z >> 8 & 255, I[_ + 2] = z >> 16 & 255, I[_ + 3] = z >> 24 & 255;
          B % l === 0 && (v = R(v), tt(v));
        }
        return k && (_ = B << 2, z = v[M], I[_] = z & 255, k > 1 && (I[_ + 1] = z >> 8 & 255), k > 2 && (I[_ + 2] = z >> 16 & 255)), I;
      };
      function ir(l, v, w) {
        $.call(this, l, v, w);
      }
      ir.prototype = new $(), ir.prototype.finalize = function() {
        return this.encode(this.outputBits, !0), $.prototype.finalize.call(this);
      };
      var tt = function(l) {
        var v, w, k, M, B, I, _, z, P, T, bt, xt, vt, St, wt, kt, Et, Mt, At, Ct, Bt, _t, Rt, It, Pt, Dt, Ot, Nt, jt, Kt, Vt, Ft, Ut, Tt, Lt, $t, zt, Wt, Ht, qt, Gt, Jt, Xt, Yt, Zt, Qt, en, tn, nn, rn, on, an, sn, cn, un, ln, fn, dn, hn, pn, yn, mn, gn;
        for (k = 0; k < 48; k += 2)
          M = l[0] ^ l[10] ^ l[20] ^ l[30] ^ l[40], B = l[1] ^ l[11] ^ l[21] ^ l[31] ^ l[41], I = l[2] ^ l[12] ^ l[22] ^ l[32] ^ l[42], _ = l[3] ^ l[13] ^ l[23] ^ l[33] ^ l[43], z = l[4] ^ l[14] ^ l[24] ^ l[34] ^ l[44], P = l[5] ^ l[15] ^ l[25] ^ l[35] ^ l[45], T = l[6] ^ l[16] ^ l[26] ^ l[36] ^ l[46], bt = l[7] ^ l[17] ^ l[27] ^ l[37] ^ l[47], xt = l[8] ^ l[18] ^ l[28] ^ l[38] ^ l[48], vt = l[9] ^ l[19] ^ l[29] ^ l[39] ^ l[49], v = xt ^ (I << 1 | _ >>> 31), w = vt ^ (_ << 1 | I >>> 31), l[0] ^= v, l[1] ^= w, l[10] ^= v, l[11] ^= w, l[20] ^= v, l[21] ^= w, l[30] ^= v, l[31] ^= w, l[40] ^= v, l[41] ^= w, v = M ^ (z << 1 | P >>> 31), w = B ^ (P << 1 | z >>> 31), l[2] ^= v, l[3] ^= w, l[12] ^= v, l[13] ^= w, l[22] ^= v, l[23] ^= w, l[32] ^= v, l[33] ^= w, l[42] ^= v, l[43] ^= w, v = I ^ (T << 1 | bt >>> 31), w = _ ^ (bt << 1 | T >>> 31), l[4] ^= v, l[5] ^= w, l[14] ^= v, l[15] ^= w, l[24] ^= v, l[25] ^= w, l[34] ^= v, l[35] ^= w, l[44] ^= v, l[45] ^= w, v = z ^ (xt << 1 | vt >>> 31), w = P ^ (vt << 1 | xt >>> 31), l[6] ^= v, l[7] ^= w, l[16] ^= v, l[17] ^= w, l[26] ^= v, l[27] ^= w, l[36] ^= v, l[37] ^= w, l[46] ^= v, l[47] ^= w, v = T ^ (M << 1 | B >>> 31), w = bt ^ (B << 1 | M >>> 31), l[8] ^= v, l[9] ^= w, l[18] ^= v, l[19] ^= w, l[28] ^= v, l[29] ^= w, l[38] ^= v, l[39] ^= w, l[48] ^= v, l[49] ^= w, St = l[0], wt = l[1], Qt = l[11] << 4 | l[10] >>> 28, en = l[10] << 4 | l[11] >>> 28, Nt = l[20] << 3 | l[21] >>> 29, jt = l[21] << 3 | l[20] >>> 29, pn = l[31] << 9 | l[30] >>> 23, yn = l[30] << 9 | l[31] >>> 23, Jt = l[40] << 18 | l[41] >>> 14, Xt = l[41] << 18 | l[40] >>> 14, Tt = l[2] << 1 | l[3] >>> 31, Lt = l[3] << 1 | l[2] >>> 31, kt = l[13] << 12 | l[12] >>> 20, Et = l[12] << 12 | l[13] >>> 20, tn = l[22] << 10 | l[23] >>> 22, nn = l[23] << 10 | l[22] >>> 22, Kt = l[33] << 13 | l[32] >>> 19, Vt = l[32] << 13 | l[33] >>> 19, mn = l[42] << 2 | l[43] >>> 30, gn = l[43] << 2 | l[42] >>> 30, cn = l[5] << 30 | l[4] >>> 2, un = l[4] << 30 | l[5] >>> 2, $t = l[14] << 6 | l[15] >>> 26, zt = l[15] << 6 | l[14] >>> 26, Mt = l[25] << 11 | l[24] >>> 21, At = l[24] << 11 | l[25] >>> 21, rn = l[34] << 15 | l[35] >>> 17, on = l[35] << 15 | l[34] >>> 17, Ft = l[45] << 29 | l[44] >>> 3, Ut = l[44] << 29 | l[45] >>> 3, It = l[6] << 28 | l[7] >>> 4, Pt = l[7] << 28 | l[6] >>> 4, ln = l[17] << 23 | l[16] >>> 9, fn = l[16] << 23 | l[17] >>> 9, Wt = l[26] << 25 | l[27] >>> 7, Ht = l[27] << 25 | l[26] >>> 7, Ct = l[36] << 21 | l[37] >>> 11, Bt = l[37] << 21 | l[36] >>> 11, an = l[47] << 24 | l[46] >>> 8, sn = l[46] << 24 | l[47] >>> 8, Yt = l[8] << 27 | l[9] >>> 5, Zt = l[9] << 27 | l[8] >>> 5, Dt = l[18] << 20 | l[19] >>> 12, Ot = l[19] << 20 | l[18] >>> 12, dn = l[29] << 7 | l[28] >>> 25, hn = l[28] << 7 | l[29] >>> 25, qt = l[38] << 8 | l[39] >>> 24, Gt = l[39] << 8 | l[38] >>> 24, _t = l[48] << 14 | l[49] >>> 18, Rt = l[49] << 14 | l[48] >>> 18, l[0] = St ^ ~kt & Mt, l[1] = wt ^ ~Et & At, l[10] = It ^ ~Dt & Nt, l[11] = Pt ^ ~Ot & jt, l[20] = Tt ^ ~$t & Wt, l[21] = Lt ^ ~zt & Ht, l[30] = Yt ^ ~Qt & tn, l[31] = Zt ^ ~en & nn, l[40] = cn ^ ~ln & dn, l[41] = un ^ ~fn & hn, l[2] = kt ^ ~Mt & Ct, l[3] = Et ^ ~At & Bt, l[12] = Dt ^ ~Nt & Kt, l[13] = Ot ^ ~jt & Vt, l[22] = $t ^ ~Wt & qt, l[23] = zt ^ ~Ht & Gt, l[32] = Qt ^ ~tn & rn, l[33] = en ^ ~nn & on, l[42] = ln ^ ~dn & pn, l[43] = fn ^ ~hn & yn, l[4] = Mt ^ ~Ct & _t, l[5] = At ^ ~Bt & Rt, l[14] = Nt ^ ~Kt & Ft, l[15] = jt ^ ~Vt & Ut, l[24] = Wt ^ ~qt & Jt, l[25] = Ht ^ ~Gt & Xt, l[34] = tn ^ ~rn & an, l[35] = nn ^ ~on & sn, l[44] = dn ^ ~pn & mn, l[45] = hn ^ ~yn & gn, l[6] = Ct ^ ~_t & St, l[7] = Bt ^ ~Rt & wt, l[16] = Kt ^ ~Ft & It, l[17] = Vt ^ ~Ut & Pt, l[26] = qt ^ ~Jt & Tt, l[27] = Gt ^ ~Xt & Lt, l[36] = rn ^ ~an & Yt, l[37] = on ^ ~sn & Zt, l[46] = pn ^ ~mn & cn, l[47] = yn ^ ~gn & un, l[8] = _t ^ ~St & kt, l[9] = Rt ^ ~wt & Et, l[18] = Ft ^ ~It & Dt, l[19] = Ut ^ ~Pt & Ot, l[28] = Jt ^ ~Tt & $t, l[29] = Xt ^ ~Lt & zt, l[38] = an ^ ~Yt & Qt, l[39] = sn ^ ~Zt & en, l[48] = mn ^ ~cn & ln, l[49] = gn ^ ~un & fn, l[0] ^= S[k], l[1] ^= S[k + 1];
      };
      if (s)
        e.exports = ge;
      else
        for (be = 0; be < Qe.length; ++be)
          o[Qe[be]] = ge[Qe[be]];
    })();
  })(ar)), ar.exports;
}
var kc = wc();
const Vi = /* @__PURE__ */ Sc(kc), Fi = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, Ui = Fi, Ti = /^[A-Za-z0-9_-]+$/, Ec = Ti, Mc = /^[A-Za-z0-9_-]+$/;
function ft(e, t) {
  const n = String(e ?? "").trim();
  if (!n) throw new Error(`${t} is required.`);
  return n;
}
function it(e, t, n, r) {
  if (!t.test(e))
    throw new Error(`Invalid ${n}: ${r ?? e}`);
  return e;
}
function Li(e) {
  const t = String(e ?? "").trim();
  if (!t) return "";
  try {
    if (/^[a-z]+:\/\//i.test(t))
      return new URL(t).hostname.trim().toLowerCase();
  } catch {
  }
  return t.replace(/^[a-z]+:\/\//i, "").replace(/[/?#].*$/g, "").replace(/:\d+$/g, "").replace(/\.+$/g, "").trim().toLowerCase();
}
function $i(e) {
  if (!e?.length) return [];
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    t.add(Xe(n));
  return Array.from(t).sort((n, r) => {
    const o = r.split(".").length - n.split(".").length;
    return o !== 0 ? o : r.length - n.length;
  });
}
function Ac(e) {
  const n = ft(e, "Canonical namespace").replace(/^me:\/\//i, "").trim().toLowerCase().split(".").map((i) => i.trim()).filter(Boolean);
  if (n.length < 3)
    throw new Error(`Invalid canonical namespace "${e}": expected handle.space with a dotted space.`);
  const r = je(n[0]), o = Xe(n.slice(1).join("."));
  return {
    handle: r,
    space: o,
    value: `${r}.${o}`
  };
}
function br(e) {
  if (e === null) return null;
  const t = String(e).trim();
  if (t === "")
    return {
      kind: "fanout",
      raw: t,
      value: t,
      shorthand: !1
    };
  if (t === "current")
    return {
      kind: "current",
      raw: t,
      value: t,
      shorthand: !1
    };
  if (t.startsWith("claim:")) {
    const o = it(t.slice(6), Ec, "claim selector token", t);
    return {
      kind: "claim",
      raw: t,
      value: `claim:${o}`,
      shorthand: !1
    };
  }
  const n = !t.startsWith("surface:"), r = it(
    n ? t : t.slice(8),
    Ti,
    "surface selector",
    t
  );
  return {
    kind: "surface",
    raw: t,
    value: `surface:${r}`,
    shorthand: n
  };
}
function zi(e) {
  const t = String(e ?? "").trim();
  if (!t)
    throw new Error("Canonical me URI path cannot be empty after '/'.");
  if (t.includes("/"))
    throw new Error(`Invalid canonical path "${e}": use "." for descent, not "/".`);
  const n = t.split(".").map((r) => r.trim());
  if (n.some((r) => !r))
    throw new Error(`Invalid canonical path "${e}": empty segments are not allowed.`);
  for (const r of n)
    it(r, Mc, "canonical path segment", e);
  return {
    value: n.join("."),
    segments: n
  };
}
function Cc(e) {
  if (!e) return "";
  const t = br(typeof e == "string" ? e : e.raw);
  return t ? `[${t.value}]` : "";
}
function Bc(e, t) {
  for (const n of $i(t))
    if (e === n || e.endsWith(`.${n}`))
      return n;
  return null;
}
function je(e) {
  return it(ft(e, "Handle").toLowerCase(), Fi, "canonical handle", String(e));
}
function Xe(e) {
  const n = Li(ft(e, "Space")).split(".").map((r) => r.trim()).filter(Boolean);
  if (n.length < 2)
    throw new Error(`Invalid canonical space "${e}": expected at least two labels.`);
  for (const r of n)
    it(r, Ui, "space label", String(e));
  return n.join(".");
}
function Tn(e) {
  const t = je(e.handle), n = Xe(e.space), r = Cc(e.selector), o = e.path == null || String(e.path).trim() === "" ? "" : `/${zi(String(e.path)).value}`;
  return `me://${t}.${n}${r}${o}`;
}
function Hr(e) {
  const t = ft(e, "me:// URI");
  if (!t.toLowerCase().startsWith("me://"))
    throw new Error(`Invalid me URI "${e}": expected "me://" scheme.`);
  const n = t.slice(5);
  if (!n.trim())
    throw new Error(`Invalid me URI "${e}": missing namespace.`);
  const r = n.indexOf("/"), o = (r >= 0 ? n.slice(0, r) : n).trim(), i = r >= 0 ? n.slice(r + 1) : "";
  let a = o, s = null;
  const c = o.indexOf("[");
  if (c >= 0) {
    const p = o.lastIndexOf("]");
    if (p < c || p !== o.length - 1)
      throw new Error(`Invalid me URI "${e}": malformed selector.`);
    a = o.slice(0, c).trim(), s = o.slice(c + 1, p).trim();
  }
  const u = Ac(a), f = br(s), d = r >= 0 ? zi(i) : null, h = Tn({
    handle: u.handle,
    space: u.space,
    selector: f,
    path: d?.value ?? null
  });
  return {
    scheme: "me",
    raw: t,
    href: h,
    namespace: u.value,
    handle: u.handle,
    space: u.space,
    selector: f,
    path: d?.value ?? null,
    segments: d?.segments ?? []
  };
}
function _c(e) {
  try {
    return Hr(e);
  } catch {
    return null;
  }
}
function Wi(e, t = {}) {
  const n = Hr(e), r = $i(t.knownSpaces);
  if (r.length > 0 && !r.includes(n.space))
    throw new Error(`Unknown canonical space "${n.space}" in "${e}".`);
  return n;
}
function Hi(e, t = {}) {
  const n = ft(e, "Human identity"), r = n.split("@");
  if (r.length !== 2)
    throw new Error(`Invalid human identity "${e}": expected handle@space.`);
  const o = je(r[0]), i = Xe(r[1]), a = Tn({ handle: o, space: i });
  return Wi(a, t), {
    raw: n,
    alias: `${o}@${i}`,
    handle: o,
    space: i,
    namespace: `${o}.${i}`,
    uri: a
  };
}
function Rc(e, t = {}) {
  const n = String(e ?? "").trim();
  if (!n.includes("@")) return null;
  try {
    return Hi(n, t).uri;
  } catch {
    return null;
  }
}
function Ic(e, t) {
  const n = Li(e);
  if (!n)
    return {
      ok: !1,
      kind: "invalid",
      rawHost: String(e ?? ""),
      host: "",
      matchedSpace: null,
      prefixLabels: [],
      reason: "INVALID_HOST"
    };
  if (n === "localhost" || n.endsWith(".local"))
    return {
      ok: !1,
      kind: "invalid",
      rawHost: e,
      host: n,
      matchedSpace: null,
      prefixLabels: [],
      reason: "TRANSPORT_ONLY_HOST"
    };
  const r = n.split(".").map((u) => u.trim()).filter(Boolean);
  if (r.length < 2)
    return {
      ok: !1,
      kind: "invalid",
      rawHost: e,
      host: n,
      matchedSpace: null,
      prefixLabels: r,
      reason: "INVALID_HOST"
    };
  for (const u of r)
    if (!Ui.test(u))
      return {
        ok: !1,
        kind: "invalid",
        rawHost: e,
        host: n,
        matchedSpace: null,
        prefixLabels: r,
        reason: "INVALID_HOST"
      };
  const o = Bc(n, t);
  if (!o)
    return {
      ok: !1,
      kind: "invalid",
      rawHost: e,
      host: n,
      matchedSpace: null,
      prefixLabels: r,
      reason: "UNKNOWN_SPACE"
    };
  const i = n === o ? "" : n.slice(0, -(o.length + 1)), a = i ? i.split(".").filter(Boolean) : [];
  if (a.length === 0)
    return {
      ok: !0,
      kind: "space",
      rawHost: e,
      host: n,
      matchedSpace: o,
      prefixLabels: [],
      space: o
    };
  if (a.length !== 1)
    return {
      ok: !1,
      kind: "invalid",
      rawHost: e,
      host: n,
      matchedSpace: o,
      prefixLabels: a,
      reason: "NOT_CANONICAL_NAMESPACE"
    };
  const s = je(a[0]), c = `${s}.${o}`;
  return {
    ok: !0,
    kind: "namespace",
    rawHost: e,
    host: n,
    matchedSpace: o,
    prefixLabels: [s],
    handle: s,
    space: o,
    namespace: c,
    uri: Tn({ handle: s, space: o })
  };
}
const Qo = "+";
function Pc(e) {
  return { __ptr: e };
}
function Z(e) {
  return !!e && typeof e == "object" && typeof e.__ptr == "string" && e.__ptr.length > 0;
}
function Dc(e) {
  return { __id: e };
}
function at(e) {
  return !!e && typeof e == "object" && typeof e.__id == "string" && e.__id.length > 0;
}
function Oc(e) {
  return !!e && typeof e == "object" && typeof e.path == "string" && typeof e.hash == "string" && typeof e.timestamp == "number";
}
function le(e) {
  return e.length === 0 ? { scope: [], leaf: null } : { scope: e.slice(0, -1), leaf: e[e.length - 1] };
}
function Ne(e, t) {
  if (t.length > e.length) return !1;
  for (let n = 0; n < t.length; n++)
    if (e[n] !== t[n]) return !1;
  return !0;
}
function ei(e) {
  const t = e.trim().toLowerCase();
  if (t.length < 3 || t.length > 63)
    throw new Error(`Invalid username length: ${t.length}. Expected 3..63 characters.`);
  if (t.includes("."))
    throw new Error(`Invalid username. "." is reserved as structure. Got: ${e}`);
  return je(t), t;
}
function ye(e, t) {
  return e[t]?.kind ?? null;
}
function qr(e, t) {
  if (e.length !== 1 || e[0] !== Qo || !Array.isArray(t) || t.length < 2) return null;
  const r = String(t[0] ?? "").trim(), o = String(t[1] ?? "").trim();
  return !r || !o || r === Qo ? null : { op: r, kind: o };
}
function qi(e, t, n) {
  if (t.length === 0) return null;
  const { scope: r, leaf: o } = le(t);
  return !o || ye(e, o) !== "secret" || typeof n != "string" ? null : { scopeKey: r.join(".") };
}
function Gr(e, t, n) {
  if (t.length === 0) return null;
  const { scope: r, leaf: o } = le(t);
  return !o || ye(e, o) !== "noise" || typeof n != "string" ? null : { scopeKey: r.join(".") };
}
function Gi(e, t, n) {
  if (t.length === 0) return null;
  const { leaf: r } = le(t);
  if (!r || ye(e, r) !== "pointer" || typeof n != "string") return null;
  const o = n.trim().replace(/^\./, "");
  return o ? { targetPath: o } : null;
}
function Ji(e, t, n) {
  if (t.length === 1 && ye(e, t[0]) === "identity")
    return typeof n != "string" ? null : { id: ei(n), targetPath: [] };
  const { scope: r, leaf: o } = le(t);
  return !o || ye(e, o) !== "identity" || typeof n != "string" ? null : { id: ei(n), targetPath: r };
}
function Jr(e, t, n) {
  if (t.length === 0) return null;
  const { scope: r, leaf: o } = le(t);
  if (!o || ye(e, o) !== "eval") return null;
  if (typeof n == "function")
    return { mode: "thunk", targetPath: r, thunk: n };
  if (Array.isArray(n) && n.length >= 2) {
    const i = String(n[0] ?? "").trim(), a = String(n[1] ?? "").trim();
    return !i || !a ? null : { mode: "assign", targetPath: r, name: i, expr: a };
  }
  return null;
}
function Xr(e, t, n) {
  if (t.length === 0) return null;
  const { scope: r, leaf: o } = le(t);
  if (!o || ye(e, o) !== "query") return null;
  let i = null, a;
  if (Array.isArray(n) && n.length > 0)
    Array.isArray(n[0]) && (n.length === 1 || typeof n[1] == "function") ? (i = n[0], a = typeof n[1] == "function" ? n[1] : void 0) : i = n;
  else
    return null;
  if (!Array.isArray(i) || i.length === 0) return null;
  const s = i.map((c) => String(c)).map((c) => c.trim()).filter((c) => c.length > 0);
  return s.length === 0 ? null : { targetPath: r, paths: s, fn: a };
}
function Yr(e, t, n) {
  if (t.length === 0) return null;
  const { scope: r, leaf: o } = le(t);
  if (!o || ye(e, o) !== "remove") return null;
  if (n == null)
    return { targetPath: r };
  if (typeof n == "string") {
    const i = n.split(".").filter(Boolean);
    return { targetPath: [...r, ...i] };
  }
  return null;
}
const { keccak256: Xi } = Vi, Nc = "this.me/wrapped-secret/v1", jc = "me.prove.v1", Kc = ":", L = new Uint8Array([254, 109, 101]), Ln = 2, xr = 16, vr = 16, $n = 3, Sr = 16, wr = 16, zn = 4, kr = 16, Er = 16, nt = 136, Vc = "this.me/blob/v2/salt", Fc = "this.me/blob/v2/enc", Uc = "this.me/blob/v2/mac", Tc = "this.me/blob/v2/stream", Lc = "this.me/blob/v2/tag", $c = "this.me/blob/v3/kdf", zc = "this.me/blob/v3/enc", Wc = "this.me/blob/v3/mac", Hc = "this.me/blob/v3/stream", qc = "this.me/blob/v3/tag", Gc = "this.me/blob/v4/kdf", Jc = "this.me/blob/v4/enc", Xc = "this.me/blob/v4/mac", Yc = "this.me/blob/v4/stream", Zc = "this.me/blob/v4/tag", st = "b64u:";
function Zr() {
  return {
    encryptCalls: 0,
    decryptCalls: 0,
    totalEncryptJsonMs: 0,
    totalEncryptAsciiMs: 0,
    totalEncryptKeystreamMs: 0,
    totalEncryptXorMs: 0,
    totalEncryptEncodeMs: 0,
    maxEncryptJsonMs: 0,
    maxEncryptAsciiMs: 0,
    maxEncryptKeystreamMs: 0,
    maxEncryptXorMs: 0,
    maxEncryptEncodeMs: 0,
    maxJsonBytes: 0,
    maxClearBytes: 0,
    maxKeystreamBytes: 0,
    maxCiphertextBytes: 0,
    maxHexBytes: 0,
    maxEncryptResidentBytes: 0,
    maxDecodedBytes: 0,
    maxDecryptClearBytes: 0,
    maxDecryptJsonBytes: 0,
    maxDecryptResidentBytes: 0,
    maxEncryptHeapDelta: 0,
    maxEncryptExternalDelta: 0,
    maxEncryptArrayBuffersDelta: 0,
    maxDecryptHeapDelta: 0,
    maxDecryptExternalDelta: 0,
    maxDecryptArrayBuffersDelta: 0
  };
}
const Ce = {
  enabled: !1,
  window: Zr()
};
function Sn() {
  const e = typeof process < "u" ? process : null, t = e?.memoryUsage;
  if (typeof t != "function")
    return {
      heapUsed: 0,
      external: 0,
      arrayBuffers: 0
    };
  const n = t.call(e);
  return {
    heapUsed: n.heapUsed ?? 0,
    external: n.external ?? 0,
    arrayBuffers: n.arrayBuffers ?? 0
  };
}
function Mr(e) {
  const t = String(e ?? "");
  return typeof Buffer < "u" ? Math.max(t.length * 2, Buffer.byteLength(t, "utf8")) : t.length * 2;
}
function se() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
function $e(e, t) {
  return Math.max(0, e - t);
}
function Qc(e = !0) {
  Ce.enabled = e, Ce.window = Zr();
}
function eu() {
  const e = { ...Ce.window };
  return Ce.window = Zr(), e;
}
function N(e) {
  const t = String(e ?? "");
  if (typeof TextEncoder < "u")
    return new TextEncoder().encode(t);
  if (typeof Buffer < "u")
    return new Uint8Array(Buffer.from(t, "utf8"));
  const n = unescape(encodeURIComponent(t)), r = new Uint8Array(n.length);
  for (let o = 0; o < n.length; o++) r[o] = n.charCodeAt(o);
  return r;
}
function dt(e) {
  if (typeof TextDecoder < "u")
    return new TextDecoder().decode(e);
  if (typeof Buffer < "u")
    return Buffer.from(e).toString("utf8");
  let t = "";
  for (let n = 0; n < e.length; n++) t += String.fromCharCode(e[n]);
  return decodeURIComponent(escape(t));
}
function Wn(e) {
  const t = e.startsWith("0x") ? e.slice(2) : e, n = new Uint8Array(t.length / 2);
  for (let r = 0; r < n.length; r++)
    n[r] = parseInt(t.substring(r * 2, r * 2 + 2), 16);
  return n;
}
function tu(e) {
  let t = "";
  for (let n = 0; n < e.length; n++)
    t += e[n].toString(16).padStart(2, "0");
  return "0x" + t;
}
function Yi(e) {
  return `${st}${De(e)}`;
}
function Hn(e) {
  return e.startsWith(st) ? ke(e.slice(st.length)) : Wn(e);
}
function nu(e) {
  const t = new Uint8Array(4);
  return new DataView(t.buffer).setUint32(0, e >>> 0, !1), t;
}
function Qr(e) {
  const t = new Uint8Array(8), n = new DataView(t.buffer), r = Math.floor(e / 4294967296), o = e >>> 0;
  return n.setUint32(0, r >>> 0, !1), n.setUint32(4, o, !1), t;
}
function fe(...e) {
  const t = e.reduce((o, i) => o + i.length, 0), n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
function K(...e) {
  for (const t of e)
    t && t.fill(0);
}
function eo(e) {
  const t = globalThis.crypto;
  if (!t?.getRandomValues)
    throw new Error("Secure random values are required for encrypted branch writes.");
  const n = new Uint8Array(e);
  return t.getRandomValues(n), n;
}
function Oe(...e) {
  const t = Xi.create();
  for (const n of e) t.update(n);
  return new Uint8Array(t.arrayBuffer());
}
function to(e) {
  return N(e.join("."));
}
function j(e) {
  return fe(nu(e.length), e);
}
function no(e, t) {
  if (e.length !== t.length) return !1;
  let n = 0;
  for (let r = 0; r < e.length; r++) n |= e[r] ^ t[r];
  return n === 0;
}
function ne(e, ...t) {
  const n = e.length > nt ? Oe(e) : Uint8Array.from(e), r = new Uint8Array(nt);
  r.set(n);
  const o = new Uint8Array(nt), i = new Uint8Array(nt);
  try {
    for (let s = 0; s < nt; s++)
      o[s] = r[s] ^ 54, i[s] = r[s] ^ 92;
    const a = Oe(o, ...t);
    try {
      return Oe(i, a);
    } finally {
      K(a);
    }
  } finally {
    K(n, r, o, i);
  }
}
function Zi(e, t) {
  const n = N(String(e ?? "")), r = to(t), o = N(Vc), i = N(Fc), a = N(Uc);
  let s = null, c = null;
  try {
    s = ne(o, j(r)), c = ne(s, j(n));
    const u = ne(c, i, j(r)), f = ne(c, a, j(r));
    return { encKey: u, macKey: f, pathContext: r };
  } finally {
    K(n, o, i, a, s, c);
  }
}
function Qi(e, t, n, r) {
  const o = new Uint8Array(r);
  let i = 0, a = 0;
  const s = N(Tc), c = j(e), u = j(t), f = j(n), d = new Uint8Array(4), h = new DataView(d.buffer);
  try {
    for (; i < r; ) {
      h.setUint32(0, a >>> 0, !1);
      const p = Oe(
        s,
        c,
        u,
        d,
        f
      );
      try {
        const y = Math.min(p.length, r - i);
        o.set(p.subarray(0, y), i), i += y, a++;
      } finally {
        K(p);
      }
    }
    return o;
  } finally {
    K(s, c, u, f, d);
  }
}
function ea(e, t, n, r, o) {
  const i = N(Lc), a = Qr(o.length);
  let s = null;
  try {
    return s = ne(
      e,
      i,
      j(t),
      j(n),
      j(r),
      a,
      o
    ), Uint8Array.from(s.subarray(0, vr));
  } finally {
    K(i, a, s);
  }
}
function ru(e, t, n) {
  return tu(
    fe(L, new Uint8Array([Ln]), e, t, n)
  );
}
function ou(e) {
  const t = Hn(e), n = L.length + 1, r = n + xr + vr + 1;
  if (t.length < r) return null;
  for (let c = 0; c < L.length; c++)
    if (t[c] !== L[c]) return null;
  if (t[L.length] !== Ln) return null;
  const o = t.subarray(0, n), i = n, a = i + xr, s = a + vr;
  return {
    header: o,
    nonce: t.subarray(i, a),
    tag: t.subarray(a, s),
    ciphertext: t.subarray(s)
  };
}
function iu(e, t, n) {
  return Yi(
    fe(L, new Uint8Array([$n]), e, t, n)
  );
}
function au(e) {
  const t = Hn(e), n = L.length + 1, r = n + Sr + wr + 1;
  if (t.length < r) return null;
  for (let c = 0; c < L.length; c++)
    if (t[c] !== L[c]) return null;
  if (t[L.length] !== $n) return null;
  const o = t.subarray(0, n), i = n, a = i + Sr, s = a + wr;
  return {
    header: o,
    nonce: t.subarray(i, a),
    tag: t.subarray(a, s),
    ciphertext: t.subarray(s)
  };
}
function ta(e, t, n) {
  const o = lu(e, t === "branch" ? "this.me/blob/v3/branch" : "this.me/blob/v3/value"), i = to(n), a = N(zc), s = N(Wc);
  try {
    const c = ne(o, a, j(i)), u = ne(o, s, j(i));
    return { encKey: c, macKey: u, pathContext: i };
  } finally {
    K(o, a, s);
  }
}
function na(e, t, n, r) {
  const o = new Uint8Array(r);
  let i = 0, a = 0;
  const s = N(Hc), c = j(e), u = j(t), f = j(n), d = new Uint8Array(4), h = new DataView(d.buffer);
  try {
    for (; i < r; ) {
      h.setUint32(0, a >>> 0, !1);
      const p = Oe(
        s,
        c,
        u,
        d,
        f
      );
      try {
        const y = Math.min(p.length, r - i);
        o.set(p.subarray(0, y), i), i += y, a++;
      } finally {
        K(p);
      }
    }
    return o;
  } finally {
    K(s, c, u, f, d);
  }
}
function ra(e, t, n, r, o) {
  const i = N(qc), a = Qr(o.length);
  let s = null;
  try {
    return s = ne(
      e,
      i,
      j(t),
      j(n),
      j(r),
      a,
      o
    ), Uint8Array.from(s.subarray(0, wr));
  } finally {
    K(i, a, s);
  }
}
function su(e, t, n) {
  const r = JSON.stringify(e), o = N(String(r)), i = eo(xr), { encKey: a, macKey: s, pathContext: c } = Zi(t, n);
  let u = null, f = null, d = null, h = null;
  try {
    u = Qi(a, i, c, o.length), f = new Uint8Array(o.length);
    for (let p = 0; p < o.length; p++)
      f[p] = o[p] ^ u[p];
    return d = fe(L, new Uint8Array([Ln])), h = ea(s, d, i, c, f), ru(i, h, f);
  } finally {
    K(o, i, a, s, c, u, f, d, h);
  }
}
function cu(e, t, n) {
  const { encKey: r, macKey: o, pathContext: i } = Zi(t, n);
  let a = null, s = null, c = null;
  try {
    if (a = ea(o, e.header, e.nonce, i, e.ciphertext), !no(a, e.tag)) return null;
    s = Qi(r, e.nonce, i, e.ciphertext.length), c = new Uint8Array(e.ciphertext.length);
    for (let f = 0; f < e.ciphertext.length; f++)
      c[f] = e.ciphertext[f] ^ s[f];
    const u = dt(c);
    return JSON.parse(u);
  } catch {
    return null;
  } finally {
    K(r, o, i, a, s, c);
  }
}
function uu(e, t, n) {
  let r = null, o = null, i = null;
  try {
    r = Wn(e);
    const a = Xi(t + Kc + n.join("."));
    o = N(a), i = new Uint8Array(r.length);
    for (let c = 0; c < r.length; c++)
      i[c] = r[c] ^ o[c % o.length];
    const s = dt(i);
    return JSON.parse(s);
  } catch {
    return null;
  } finally {
    K(r, o, i);
  }
}
function lu(e, t) {
  if (!Array.isArray(e) || e.length < 6)
    throw new Error("V3 derivation requires a complete secret chain.");
  const n = N($c), r = N(t), o = [n, j(r), ...e.map((a) => j(a))];
  let i = null;
  try {
    return i = fe(...o), Oe(i);
  } finally {
    K(n, r, i, ...o);
  }
}
function ht(e) {
  try {
    const t = Hn(e);
    if (t.length < L.length + 1) return "legacy";
    for (let r = 0; r < L.length; r++)
      if (t[r] !== L[r]) return "legacy";
    const n = t[L.length];
    return n === zn ? "v4" : n === $n ? "v3" : n === Ln ? "v2" : "legacy";
  } catch {
    return "legacy";
  }
}
function fu(e, t, n) {
  if (!(n instanceof Uint8Array) || n.length === 0)
    throw new Error("V4 derivation requires an unlocked identity root.");
  if (!Array.isArray(e) || e.length < 5)
    throw new Error("V4 derivation requires a complete secret chain.");
  const r = N(Gc), o = N(t), i = [r, j(o), ...e.map((s) => j(s))];
  let a = null;
  try {
    return a = fe(...i), ne(n, a);
  } finally {
    K(r, o, a, ...i);
  }
}
function ro(e, t, n, r) {
  const i = fu(e, t === "branch" ? "this.me/blob/v4/branch" : "this.me/blob/v4/value", r), a = to(n), s = N(Jc), c = N(Xc);
  try {
    const u = ne(i, s, j(a)), f = ne(i, c, j(a));
    return { encKey: u, macKey: f, pathContext: a };
  } finally {
    K(i, s, c);
  }
}
function oa(e, t, n, r) {
  const o = new Uint8Array(r);
  let i = 0, a = 0;
  const s = N(Yc), c = j(e), u = j(t), f = j(n), d = new Uint8Array(4), h = new DataView(d.buffer);
  try {
    for (; i < r; ) {
      h.setUint32(0, a >>> 0, !1);
      const p = Oe(
        s,
        c,
        u,
        d,
        f
      );
      try {
        const y = Math.min(p.length, r - i);
        o.set(p.subarray(0, y), i), i += y, a++;
      } finally {
        K(p);
      }
    }
    return o;
  } finally {
    K(s, c, u, f, d);
  }
}
function ia(e, t, n, r, o) {
  const i = N(Zc), a = Qr(o.length);
  let s = null;
  try {
    return s = ne(
      e,
      i,
      j(t),
      j(n),
      j(r),
      a,
      o
    ), Uint8Array.from(s.subarray(0, Er));
  } finally {
    K(i, a, s);
  }
}
function du(e, t, n) {
  return Yi(
    fe(L, new Uint8Array([zn]), e, t, n)
  );
}
function hu(e) {
  const t = Hn(e), n = L.length + 1, r = n + kr + Er + 1;
  if (t.length < r) return null;
  for (let c = 0; c < L.length; c++)
    if (t[c] !== L[c]) return null;
  if (t[L.length] !== zn) return null;
  const o = t.subarray(0, n), i = n, a = i + kr, s = a + Er;
  return {
    header: o,
    nonce: t.subarray(i, a),
    tag: t.subarray(a, s),
    ciphertext: t.subarray(s)
  };
}
function pu(e, t, n, r, o) {
  const i = ro(t, n, r, o);
  try {
    return aa(e, i);
  } finally {
    K(i.encKey, i.macKey, i.pathContext);
  }
}
function aa(e, t) {
  const n = JSON.stringify(e), r = N(String(n)), o = eo(kr);
  let i = null, a = null, s = null, c = null;
  try {
    i = oa(t.encKey, o, t.pathContext, r.length), a = new Uint8Array(r.length);
    for (let u = 0; u < r.length; u++)
      a[u] = r[u] ^ i[u];
    return s = fe(L, new Uint8Array([zn])), c = ia(t.macKey, s, o, t.pathContext, a), du(o, c, a);
  } finally {
    K(r, o, i, a, s, c);
  }
}
function yu(e, t, n, r, o) {
  const i = ro(t, n, r, o);
  try {
    return oo(e, i);
  } finally {
    K(i.encKey, i.macKey, i.pathContext);
  }
}
function oo(e, t) {
  const n = hu(e);
  if (!n) return null;
  let r = null, o = null, i = null;
  try {
    if (r = ia(t.macKey, n.header, n.nonce, t.pathContext, n.ciphertext), !no(r, n.tag)) return null;
    o = oa(t.encKey, n.nonce, t.pathContext, n.ciphertext.length), i = new Uint8Array(n.ciphertext.length);
    for (let s = 0; s < n.ciphertext.length; s++)
      i[s] = n.ciphertext[s] ^ o[s];
    const a = dt(i);
    return JSON.parse(a);
  } catch {
    return null;
  } finally {
    K(r, o, i);
  }
}
function mu(e, t, n, r) {
  const { encKey: o, macKey: i, pathContext: a } = ta(t, n, r);
  try {
    return sa(e, { encKey: o, macKey: i, pathContext: a });
  } finally {
    K(o, i, a);
  }
}
function sa(e, t) {
  const n = Ce.enabled, r = n ? Sn() : null, o = n ? se() : 0, i = JSON.stringify(e), a = n ? se() - o : 0, s = n ? Mr(i) : 0, c = n ? se() : 0, u = N(String(i)), f = n ? se() - c : 0, d = n ? u.length : 0, h = eo(Sr);
  let p = null, y = null, S = null, g = null, b = null;
  try {
    const A = n ? se() : 0;
    p = na(t.encKey, h, t.pathContext, u.length);
    const m = n ? se() - A : 0, x = n ? se() : 0;
    y = new Uint8Array(u.length);
    for (let R = 0; R < u.length; R++)
      y[R] = u[R] ^ p[R];
    const E = n ? se() - x : 0, C = n ? se() : 0;
    S = fe(L, new Uint8Array([$n])), g = ra(t.macKey, S, h, t.pathContext, y), b = iu(h, g, y);
    const D = n ? se() - C : 0;
    if (n && r) {
      const R = p?.length ?? 0, V = y?.length ?? 0, q = Mr(b), Ke = Math.max(
        s,
        s + d,
        s + d + R,
        s + d + R + V,
        s + d + R + V + q
      ), Ve = Sn(), O = Ce.window;
      O.encryptCalls += 1, O.totalEncryptJsonMs += a, O.totalEncryptAsciiMs += f, O.totalEncryptKeystreamMs += m, O.totalEncryptXorMs += E, O.totalEncryptEncodeMs += D, O.maxEncryptJsonMs = Math.max(O.maxEncryptJsonMs, a), O.maxEncryptAsciiMs = Math.max(O.maxEncryptAsciiMs, f), O.maxEncryptKeystreamMs = Math.max(O.maxEncryptKeystreamMs, m), O.maxEncryptXorMs = Math.max(O.maxEncryptXorMs, E), O.maxEncryptEncodeMs = Math.max(O.maxEncryptEncodeMs, D), O.maxJsonBytes = Math.max(O.maxJsonBytes, s), O.maxClearBytes = Math.max(O.maxClearBytes, d), O.maxKeystreamBytes = Math.max(O.maxKeystreamBytes, R), O.maxCiphertextBytes = Math.max(O.maxCiphertextBytes, V), O.maxHexBytes = Math.max(O.maxHexBytes, q), O.maxEncryptResidentBytes = Math.max(O.maxEncryptResidentBytes, Ke), O.maxEncryptHeapDelta = Math.max(O.maxEncryptHeapDelta, $e(Ve.heapUsed, r.heapUsed)), O.maxEncryptExternalDelta = Math.max(O.maxEncryptExternalDelta, $e(Ve.external, r.external)), O.maxEncryptArrayBuffersDelta = Math.max(
        O.maxEncryptArrayBuffersDelta,
        $e(Ve.arrayBuffers, r.arrayBuffers)
      );
    }
    return b;
  } finally {
    K(u, h, p, y, S, g);
  }
}
function io(e, t) {
  const n = Ce.enabled, r = n ? Sn() : null, o = au(e);
  if (!o) return null;
  let i = null, a = null, s = null, c = null;
  try {
    if (i = ra(t.macKey, o.header, o.nonce, t.pathContext, o.ciphertext), !no(i, o.tag)) return null;
    a = na(t.encKey, o.nonce, t.pathContext, o.ciphertext.length), s = new Uint8Array(o.ciphertext.length);
    for (let d = 0; d < o.ciphertext.length; d++)
      s[d] = o.ciphertext[d] ^ a[d];
    c = dt(s);
    const f = JSON.parse(c);
    if (n && r) {
      const d = o.header.length + o.nonce.length + o.tag.length + o.ciphertext.length, h = s.length, p = Mr(c), y = Math.max(
        d,
        d + (i?.length ?? 0),
        d + (i?.length ?? 0) + (a?.length ?? 0),
        d + (i?.length ?? 0) + (a?.length ?? 0) + h,
        d + (i?.length ?? 0) + (a?.length ?? 0) + h + p
      ), S = Sn(), g = Ce.window;
      g.decryptCalls += 1, g.maxDecodedBytes = Math.max(g.maxDecodedBytes, d), g.maxDecryptClearBytes = Math.max(g.maxDecryptClearBytes, h), g.maxDecryptJsonBytes = Math.max(g.maxDecryptJsonBytes, p), g.maxDecryptResidentBytes = Math.max(g.maxDecryptResidentBytes, y), g.maxDecryptHeapDelta = Math.max(g.maxDecryptHeapDelta, $e(S.heapUsed, r.heapUsed)), g.maxDecryptExternalDelta = Math.max(g.maxDecryptExternalDelta, $e(S.external, r.external)), g.maxDecryptArrayBuffersDelta = Math.max(
        g.maxDecryptArrayBuffersDelta,
        $e(S.arrayBuffers, r.arrayBuffers)
      );
    }
    return f;
  } catch {
    return null;
  } finally {
    K(i, a, s);
  }
}
function ca(e, t, n) {
  return su(e, t, n);
}
function ao(e, t, n) {
  try {
    const r = ou(e);
    return r ? cu(r, t, n) : uu(e, t, n);
  } catch {
    return null;
  }
}
function so(e) {
  if (typeof e != "string") return !1;
  if (e.startsWith("0x")) {
    const t = e.slice(2);
    return t.length < 2 || t.length % 2 !== 0 ? !1 : /^[0-9a-fA-F]+$/.test(t);
  }
  if (e.startsWith(st)) {
    const t = e.slice(st.length);
    return t.length > 0 && /^[A-Za-z0-9\-_]+$/.test(t);
  }
  return !1;
}
function De(e) {
  if (typeof Buffer < "u")
    return Buffer.from(e).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  let t = "";
  for (let n = 0; n < e.length; n++) t += String.fromCharCode(e[n]);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function ke(e) {
  const t = String(e || "").replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(String(e || "").length / 4) * 4, "=");
  if (typeof Buffer < "u")
    return new Uint8Array(Buffer.from(t, "base64"));
  const n = atob(t), r = new Uint8Array(n.length);
  for (let o = 0; o < n.length; o++) r[o] = n.charCodeAt(o);
  return r;
}
function wn(e) {
  if (e === null || typeof e != "object")
    return JSON.stringify(e);
  if (Array.isArray(e))
    return `[${e.map((r) => wn(r)).join(",")}]`;
  const t = e;
  return `{${Object.keys(t).sort().map((r) => `${JSON.stringify(r)}:${wn(t[r])}`).join(",")}}`;
}
function ie() {
  const e = globalThis.crypto;
  if (!e?.subtle)
    throw new Error("WebCrypto subtle crypto is required for wrapped secret operations.");
  return e;
}
function gu(e) {
  if (e.length < 16) throw new Error("AES-GCM payload is too short.");
  return {
    ciphertext: e.slice(0, e.length - 16),
    tag: e.slice(e.length - 16)
  };
}
function J(e) {
  const t = Uint8Array.from(e);
  return t.buffer.slice(t.byteOffset, t.byteOffset + t.byteLength);
}
function bu(e) {
  return typeof e == "string" ? N(e) : new Uint8Array(e);
}
function xu(e) {
  const t = String(e || "").trim();
  if (!t) throw new Error("Seed material is required.");
  const n = t.startsWith("0x") ? t.slice(2) : t;
  return n.length > 0 && n.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(n) ? Wn(n) : N(t);
}
function vu(e = 32) {
  const t = Number(e);
  if (!Number.isInteger(t) || t <= 0)
    throw new Error("HKDF output length must be a positive integer.");
  return t;
}
function Su(...e) {
  const t = e.reduce((o, i) => o + i.length, 0), n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
async function ua(e, t, n, r = 32) {
  const o = vu(r), { subtle: i } = ie(), a = await i.importKey("raw", J(new Uint8Array(e)), "HKDF", !1, ["deriveBits"]), s = await i.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: J(N(String(t || ""))),
      info: J(N(String(n || "")))
    },
    a,
    o * 8
  );
  return new Uint8Array(s);
}
async function wu(e, t) {
  const n = String(t || "").trim();
  if (!n) throw new Error("Active expression is required to derive a branch proof seed.");
  return ua(
    xu(e),
    jc,
    n,
    32
  );
}
async function ku(e) {
  if (!(e instanceof Uint8Array) || e.length !== 32)
    throw new Error("Ed25519 signing seed must be exactly 32 bytes.");
  const { subtle: t } = ie(), n = Wn("302e020100300506032b657004220420"), r = Su(n, new Uint8Array(e)), o = await t.importKey(
    "pkcs8",
    J(r),
    { name: "Ed25519" },
    !0,
    ["sign"]
  ), i = await t.exportKey("jwk", o);
  if (i.kty !== "OKP" || i.crv !== "Ed25519" || !i.x)
    throw new Error("Unable to derive Ed25519 public key from signing seed.");
  const a = await t.importKey(
    "raw",
    J(ke(i.x)),
    { name: "Ed25519" },
    !0,
    ["verify"]
  );
  return { privateKey: o, publicKey: a };
}
async function Eu(e, t) {
  const { subtle: n } = ie(), r = await n.sign(
    "Ed25519",
    e,
    J(N(String(t || "")))
  );
  return De(new Uint8Array(r));
}
async function Mu(e, t, n) {
  try {
    const { subtle: r } = ie(), o = await r.importKey(
      "raw",
      J(ke(String(e || ""))),
      { name: "Ed25519" },
      !0,
      ["verify"]
    );
    return await r.verify(
      "Ed25519",
      o,
      J(ke(String(n || ""))),
      J(N(String(t || "")))
    );
  } catch {
    return !1;
  }
}
async function Au(e) {
  const { subtle: t } = ie(), n = await t.exportKey("raw", e);
  return De(new Uint8Array(n));
}
async function la(e, t) {
  const { subtle: n } = ie(), r = await n.importKey("raw", J(e), "HKDF", !1, ["deriveKey"]);
  return n.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: J(t),
      info: J(N(Nc))
    },
    r,
    { name: "AES-GCM", length: 256 },
    !1,
    ["encrypt", "decrypt"]
  );
}
async function fa(e = !0, t = ["deriveKey", "deriveBits"]) {
  const { subtle: n } = ie();
  return n.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256"
    },
    e,
    t
  );
}
async function da(e) {
  const { subtle: t } = ie(), n = await t.exportKey("jwk", e);
  if (n.kty !== "EC" || n.crv !== "P-256" || !n.x || !n.y)
    throw new Error("Public key is not a valid P-256 EC key.");
  return {
    kty: "EC",
    crv: "P-256",
    x: n.x,
    y: n.y
  };
}
async function co(e) {
  const { subtle: t } = ie();
  return t.importKey(
    "jwk",
    {
      key_ops: [],
      ext: !0,
      kty: e.kty,
      crv: e.crv,
      x: e.x,
      y: e.y
    },
    {
      name: "ECDH",
      namedCurve: "P-256"
    },
    !0,
    []
  );
}
async function Cu(e) {
  const t = ie(), { subtle: n } = t, r = e.recipientPublicKey instanceof CryptoKey ? e.recipientPublicKey : await co(e.recipientPublicKey), o = await fa(!0, ["deriveBits"]), i = await n.deriveBits(
    {
      name: "ECDH",
      public: r
    },
    o.privateKey,
    256
  ), a = t.getRandomValues(new Uint8Array(32)), s = t.getRandomValues(new Uint8Array(12)), c = new Uint8Array(i), u = await la(c, a), f = bu(e.secret);
  let d = null, h = null, p = null;
  try {
    return d = new Uint8Array(
      await n.encrypt(
        {
          name: "AES-GCM",
          iv: J(s)
        },
        u,
        J(f)
      )
    ), { ciphertext: h, tag: p } = gu(d), {
      version: 1,
      class: e.class,
      kid: String(e.kid || "").trim(),
      publicKey: e.publicKey,
      encryption: {
        kex: "ECDH-ES",
        kdf: "HKDF-SHA-256",
        aead: "AES-256-GCM",
        iv: De(s),
        salt: De(a),
        tag: De(p),
        ciphertext: De(h),
        ephemeralPK: await da(o.publicKey)
      },
      policy: e.policy
    };
  } finally {
    K(c, a, s, f, d, h, p);
  }
}
async function ha(e, t, n = "bytes") {
  const { subtle: r } = ie();
  if (e.version !== 1) throw new Error(`Unsupported wrapped secret version: ${e.version}`);
  if (e.encryption.kex !== "ECDH-ES") throw new Error("Unsupported key exchange algorithm.");
  if (e.encryption.kdf !== "HKDF-SHA-256") throw new Error("Unsupported KDF.");
  if (e.encryption.aead !== "AES-256-GCM") throw new Error("Unsupported AEAD.");
  const o = await co(e.encryption.ephemeralPK), i = await r.deriveBits(
    {
      name: "ECDH",
      public: o
    },
    t,
    256
  ), a = ke(e.encryption.salt), s = ke(e.encryption.iv), c = ke(e.encryption.ciphertext), u = ke(e.encryption.tag), f = new Uint8Array(i), d = await la(f, a), h = fe(c, u);
  let p = null;
  try {
    if (p = new Uint8Array(
      await r.decrypt(
        {
          name: "AES-GCM",
          iv: J(s)
        },
        d,
        J(h)
      )
    ), n === "utf8") {
      const y = dt(p);
      return K(p), y;
    }
    return p;
  } finally {
    K(f, a, s, c, u, h);
  }
}
function pe(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n++)
    t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
  return ("00000000" + (t >>> 0).toString(16)).slice(-8);
}
function X(e) {
  const t = globalThis.structuredClone;
  return typeof t == "function" ? t(e) : JSON.parse(JSON.stringify(e));
}
function pa(e, t) {
  let n = 0;
  for (let r = 0; r < e.length; r++) {
    const o = e[r];
    if (o === "[") n++;
    else if (o === "]") n = Math.max(0, n - 1);
    else if (o === t && n === 0) return r;
  }
  return -1;
}
function F(e) {
  const t = [];
  for (const n of e) {
    const r = String(n).trim();
    if (!r) continue;
    const o = r.indexOf("[");
    if (o === -1) {
      t.push(r);
      continue;
    }
    const i = r.slice(0, o).trim(), a = r.slice(o), s = [];
    let c = !0, u = 0;
    for (; u < a.length; ) {
      if (a[u] !== "[") {
        c = !1;
        break;
      }
      const f = a[u + 1];
      if (f === '"' || f === "'") {
        const S = a.indexOf(f, u + 2);
        if (S !== -1 && a[S + 1] === "]") {
          s.push({ text: a.slice(u + 2, S), quoted: !0 }), u = S + 2;
          continue;
        }
      }
      const d = a.indexOf("]", u + 1);
      if (d === -1) {
        c = !1;
        break;
      }
      let p = a.slice(u + 1, d).trim(), y = !1;
      p.length >= 2 && (p.startsWith('"') && p.endsWith('"') || p.startsWith("'") && p.endsWith("'")) && (p = p.slice(1, -1), y = !0), s.push({ text: p, quoted: y }), u = d + 1;
    }
    if (!c) {
      i && t.push(i), t.push(a);
      continue;
    }
    if (s.some((f) => !f.quoted && f.text === "")) {
      t.push(r);
      continue;
    }
    i && t.push(i);
    for (const f of s)
      f.text && t.push(f.text);
  }
  return t;
}
function ya(e) {
  const t = [];
  for (const n of e) {
    const r = String(n).trim();
    if (!r) continue;
    const o = r.indexOf("[");
    if (o === -1) {
      t.push(r);
      continue;
    }
    const i = r.slice(0, o).trim(), a = r.slice(o);
    i && t.push(i);
    const s = Array.from(a.matchAll(/\[([^\]]*)\]/g));
    if (s.map((u) => u[0]).join("") !== a) {
      t.push(a);
      continue;
    }
    for (const u of s) {
      let f = (u[1] ?? "").trim();
      (f.startsWith('"') && f.endsWith('"') || f.startsWith("'") && f.endsWith("'")) && (f = f.slice(1, -1)), f && t.push(f);
    }
  }
  return t;
}
function ma(e) {
  return e.some((t) => t.includes("[i]"));
}
function uo(e, t) {
  return e.map((n) => n.split("[i]").join(`[${t}]`));
}
function ga(e, t) {
  return String(e ?? "").split("[i]").join(`[${t}]`);
}
function ba(e) {
  const n = String(e ?? "").trim().match(/^(.+?)\s*(>=|<=|==|!=|>|<)\s*(.+)$/);
  if (!n) return null;
  const r = n[1].trim(), o = n[2], i = n[3].trim();
  return !r || !i ? null : { left: r, op: o, right: i };
}
function Ye(e) {
  const t = String(e ?? "").trim();
  if (!t) return null;
  const n = t.split(/\s*(&&|\|\|)\s*/).filter((i) => i.length > 0);
  if (n.length === 0) return null;
  const r = [], o = [];
  for (let i = 0; i < n.length; i++)
    if (i % 2 === 0) {
      const a = ba(n[i]);
      if (!a) return null;
      r.push(a);
    } else {
      const a = n[i];
      if (a !== "&&" && a !== "||") return null;
      o.push(a);
    }
  return r.length === 0 || o.length !== Math.max(0, r.length - 1) ? null : { clauses: r, ops: o };
}
function xa(e, t, n) {
  switch (t) {
    case ">":
      return e > n;
    case "<":
      return e < n;
    case ">=":
      return e >= n;
    case "<=":
      return e <= n;
    case "==":
      return e == n;
    case "!=":
      return e != n;
    default:
      return !1;
  }
}
function va(e) {
  const t = e.trim();
  if (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'"))
    return { kind: "literal", value: t.slice(1, -1) };
  if (t === "true") return { kind: "literal", value: !0 };
  if (t === "false") return { kind: "literal", value: !1 };
  if (t === "null") return { kind: "literal", value: null };
  const n = Number(t);
  return Number.isFinite(n) ? { kind: "literal", value: n } : { kind: "path", parts: F(t.split(".").filter(Boolean)) };
}
function Be(e) {
  const t = String(e ?? "").trim(), n = t.indexOf("["), r = t.lastIndexOf("]");
  if (n <= 0 || r <= n || r !== t.length - 1) return null;
  const o = t.slice(0, n).trim(), i = t.slice(n + 1, r).trim();
  return !o || !i ? null : { base: o, selector: i };
}
function lo(e) {
  const t = e.trim();
  if (t.startsWith("[") && t.endsWith("]")) {
    const r = t.slice(1, -1).trim();
    return r ? r.split(",").map((i) => i.trim()).filter(Boolean).map((i) => i.startsWith('"') && i.endsWith('"') || i.startsWith("'") && i.endsWith("'") ? i.slice(1, -1) : i) : [];
  }
  const n = t.match(/^(-?\d+)\s*\.\.\s*(-?\d+)$/);
  if (n) {
    const r = Number(n[1]), o = Number(n[2]);
    if (!Number.isFinite(r) || !Number.isFinite(o)) return null;
    const i = r <= o ? 1 : -1, a = [];
    if (Math.abs(o - r) > 1e4) return null;
    for (let c = r; i > 0 ? c <= o : c >= o; c += i) a.push(String(c));
    return a;
  }
  return null;
}
function kn(e) {
  const n = e.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=>\s*(.+)$/);
  if (!n) return null;
  const r = n[1].trim(), o = n[2].trim();
  return !r || !o ? null : { varName: r, expr: o };
}
function Sa() {
  return {
    _: { kind: "secret" },
    "~": { kind: "noise" },
    __: { kind: "pointer" },
    "->": { kind: "pointer" },
    "@": { kind: "identity" },
    "=": { kind: "eval" },
    "?": { kind: "query" },
    "-": { kind: "remove" }
  };
}
function qn(e) {
  return e._memories[e._memories.length - 1]?.hash ?? "";
}
function wa(e) {
  const t = [];
  let n = 0;
  for (; n < e.length; ) {
    const r = e[n];
    if (r === "]") return null;
    if (r !== "[") {
      n++;
      continue;
    }
    const o = n, i = e[n + 1];
    if (i === '"' || i === "'") {
      const u = e.indexOf(i, n + 2);
      if (u !== -1 && e[u + 1] === "]") {
        const f = e.slice(n + 2, u);
        t.push({ start: o, end: u + 2, content: e.slice(n + 1, u + 1), quoted: !0, literal: f }), n = u + 2;
        continue;
      }
    }
    let a = 0, s = null, c = n;
    for (; c < e.length; c++) {
      const u = e[c];
      if (s) {
        u === s && (s = null);
        continue;
      }
      if (u === '"' || u === "'") {
        s = u;
        continue;
      }
      if (u === "[") a++;
      else if (u === "]" && (a--, a === 0))
        break;
    }
    if (c >= e.length) return null;
    t.push({ start: o, end: c + 1, content: e.slice(n + 1, c), quoted: !1 }), n = c + 1;
  }
  return t;
}
const ka = String.raw`[^.\[\]"'\s+*/%()<>=!&|,]+`, Bu = new RegExp(String.raw`^(?:\.${ka})+$`);
function _u(e, t = !1) {
  if (t) return !0;
  const n = String(e ?? "").trim();
  return !(!n || kn(n) || lo(n) !== null || Ye(n));
}
function Ru(e) {
  return _u(e.content, e.quoted);
}
function Iu(e, t) {
  let n = "", r = 0;
  for (const i of t)
    n += e.slice(r, i.start) + "\0", r = i.end;
  return n += e.slice(r), n.split(".").every((i, a) => {
    if (i === "") return !1;
    const s = i.replace(/\u0000/g, "");
    return s === "" ? a === 0 && i.startsWith("\0") : new RegExp(`^${ka}$`).test(s) ? !/\u0000[^\u0000]/.test(i) : !1;
  });
}
const sr = Object.freeze({ kind: "plain" });
function pt(e) {
  const t = String(e ?? "").trim();
  if (!t.includes("[")) return sr;
  const n = wa(t);
  if (!n) return sr;
  const r = n.filter((p) => !p.quoted && p.content === ""), o = n.filter((p) => !p.quoted && p.content !== "" && p.content.trim() === ""), i = n.filter((p) => p.quoted);
  if (i.some((p) => p.start > 0 && t[p.start - 1] === "." && /[\[\]]/.test(p.literal ?? "")))
    return { kind: "rejected", reason: "dotted-literal-selector" };
  const a = i.some((p) => (p.literal ?? "").includes("."));
  if (r.length === 0 && o.length === 0)
    return i.length === 0 || a ? sr : { kind: "literal", segments: F(ti(t)) };
  if (o.length > 0) return { kind: "rejected", reason: "whitespace-selector" };
  if (a) return { kind: "rejected", reason: "invalid-collection-path" };
  if (r.length > 1) return { kind: "rejected", reason: "nested-aggregate" };
  const s = r[0], c = t.slice(0, s.start), u = t.slice(s.end);
  if (!c) return { kind: "rejected", reason: "empty-collection-path" };
  if (c.endsWith(".")) return { kind: "rejected", reason: "operator-as-segment" };
  if (u !== "" && !Bu.test(u)) return { kind: "rejected", reason: "invalid-field" };
  const f = n.filter((p) => p.end <= s.start);
  if (c.startsWith("[") && !(f[0] && f[0].start === 0 && f[0].quoted))
    return { kind: "rejected", reason: "invalid-collection-path" };
  if (!Iu(c, f)) return { kind: "rejected", reason: "invalid-collection-path" };
  if (!f.every(Ru)) return { kind: "rejected", reason: "selector-on-collection" };
  const d = F(ti(c));
  if (d.length === 0) return { kind: "rejected", reason: "empty-collection-path" };
  const h = u ? u.slice(1).split(".") : null;
  return { kind: "aggregate", ref: { text: t, collection: d, field: h, op: h ? "sum" : "count" } };
}
function ti(e) {
  const t = [];
  let n = "", r = 0, o = null;
  for (const i of String(e ?? "")) {
    if (o) {
      n += i, i === o && (o = null);
      continue;
    }
    if (i === '"' || i === "'") {
      o = i, n += i;
      continue;
    }
    if (i === "[" ? r++ : i === "]" && (r = Math.max(0, r - 1)), i === "." && r === 0) {
      n.trim() && t.push(n.trim()), n = "";
      continue;
    }
    n += i;
  }
  return n.trim() && t.push(n.trim()), t;
}
function Ea(e) {
  return !/[\[\]"']/.test(e);
}
function We(e) {
  let t = "";
  for (const n of e)
    Ea(n) ? t += (t ? "." : "") + n : t += n.includes('"') ? `['${n}']` : `["${n}"]`;
  return t;
}
function ze(e) {
  return Ea(e) ? e : We(String(e).split(".").filter(Boolean));
}
function Ma(e) {
  return We(e.collection) + "[]" + (e.field ? "." + e.field.join(".") : "");
}
const fo = (e) => String.raw`${e}(?:\.${e})*\[\](?:\.[A-Za-z_][A-Za-z0-9_]*)*`;
function Pu(e) {
  const t = wa(e);
  return !!t && t.some((n) => !n.quoted && n.content !== "" && n.content.trim() === "");
}
const Du = 20, cr = new DataView(new ArrayBuffer(8));
function Ou(e) {
  cr.setFloat64(0, e);
  const t = cr.getUint32(0), n = cr.getUint32(4), r = t >>> 31 === 1, o = t >>> 20 & 2047;
  let i = BigInt(t & 1048575) << 32n | BigInt(n), a;
  o === 0 ? a = 0 : (i |= 1n << 52n, a = o - 1);
  const s = i << BigInt(a);
  return r ? -s : s;
}
function Nu(e) {
  return e === 0n ? 0 : e.toString(2).length;
}
function ju(e) {
  const t = Nu(e);
  if (t <= 53) return Number(e) * 2 ** -1074;
  let n = t - 53, r = e >> BigInt(n);
  const o = e - (r << BigInt(n)), i = 1n << BigInt(n - 1);
  (o > i || o === i && (r & 1n) === 1n) && (r += 1n), r === 1n << 53n && (r >>= 1n, n += 1);
  const a = n - 1074;
  return a > 971 ? 1 / 0 : Number(r) * 2 ** a;
}
function Ku(e) {
  let t = 0n;
  for (const r of e) t += Ou(r);
  if (t === 0n) return 0;
  const n = ju(t < 0n ? -t : t);
  return t < 0n ? -n : n;
}
function Aa(e, t) {
  const n = t.split(".");
  for (let r = n.length; r >= 0; r--) {
    const o = n.slice(0, r).join(".");
    if (typeof e.localSecrets[o] == "string") return !0;
    const i = e.index[o];
    if (i && typeof i == "object" && "meta" in i && i.meta?.origin === "stealth") return !0;
  }
  return !1;
}
function Vu(e, t) {
  return !Aa(e, t);
}
function ni(e, t) {
  return !Object.prototype.hasOwnProperty.call(e.index, t) || so(e.index[t]) ? !1 : !Aa(e, t);
}
function Ca(e, t, n, r) {
  if (e.recomputeMode !== "lazy") return;
  const o = t + ".";
  for (const i of Object.keys(e.derivations))
    i === n || !i.startsWith(o) || !Vu(e, i) || (r ? r(i) : e.ensureTargetFresh(i));
}
const ur = (e, t) => e < t ? -1 : e > t ? 1 : 0;
function Ba(e, t, n, r) {
  const o = { members: null, terms: null, domain: null };
  if (n === "authorized")
    return { value: void 0, status: "unsupported", reason: "authorized-context-unsupported", ...o };
  const i = t.collection.join(".");
  if (r !== void 0 && (r === i || r.startsWith(i + ".")))
    return { value: void 0, status: "cycle", ...o };
  for (let m = 1; m <= t.collection.length; m++)
    if (Z(e.index[t.collection.slice(0, m).join(".")]))
      return { value: void 0, status: "deferred", reason: "pointer", ...o };
  Ca(e, i, r);
  const a = i + ".", s = /* @__PURE__ */ new Map();
  for (const m of Object.keys(e.index)) {
    if (!m.startsWith(a)) continue;
    const x = m.slice(a.length), E = x.indexOf("."), C = E === -1 ? x : x.slice(0, E);
    if (!ni(e, m)) continue;
    const D = s.get(C);
    D ? D.push(m) : s.set(C, [m]);
  }
  const c = [...s.keys()].sort(ur), u = c.length;
  if (u === 0) return { value: void 0, status: "absent", ...o };
  for (const m of c) {
    const x = a + m;
    if (Z(e.index[x])) return { value: void 0, status: "deferred", reason: "pointer", members: u, terms: null, domain: null };
  }
  if (t.op === "count") return { value: u, status: "resolved", members: u, terms: null, domain: null };
  const f = t.field, d = [];
  let h = 0;
  const p = [], y = [];
  for (const m of c) {
    const x = [...t.collection, m, ...f];
    for (let R = t.collection.length + 2; R < x.length; R++)
      if (Z(e.index[x.slice(0, R).join(".")]))
        return { value: void 0, status: "deferred", reason: "pointer", members: u, terms: null, domain: null };
    const E = x.join(".");
    if (Z(e.index[E])) return { value: void 0, status: "deferred", reason: "pointer", members: u, terms: null, domain: null };
    const C = We(x);
    let D;
    ni(e, E) ? D = e.index[E] : s.get(m).some((R) => R.startsWith(E + ".")) && (D = {}), D === void 0 ? y.push({ path: C, kind: "missing" }) : D === null ? y.push({ path: C, kind: "null" }) : typeof D == "boolean" ? (h++, p.push(C), d.push(D ? 1 : 0)) : typeof D == "number" ? Number.isFinite(D) ? d.push(D) : y.push({ path: C, kind: "non-finite" }) : y.push({ path: C, kind: "non-numeric" });
  }
  const S = d.length - h;
  if (h > 0 && S > 0) for (const m of p) y.push({ path: m, kind: "mixed-domain" });
  const g = d.length === 0 ? null : h > 0 && S === 0 ? "boolean" : "number", b = h > 0 && S > 0 ? S : d.length;
  if (y.length > 0)
    return y.sort((m, x) => ur(m.path, x.path) || ur(m.kind, x.kind)), {
      value: void 0,
      status: "incomplete",
      members: u,
      terms: b,
      domain: g,
      problems: { count: y.length, sample: y.slice(0, Du) }
    };
  const A = Ku(d);
  return Number.isFinite(A) ? { value: A, status: "resolved", members: u, terms: b, domain: g } : { value: void 0, status: "non-finite", reason: "overflow", members: u, terms: b, domain: g };
}
function Fu(e, t) {
  return e.recomputeMode = t, e;
}
function Uu(e) {
  return e.recomputeMode;
}
function _a(e, t, n, r) {
  const i = ho(n).key;
  switch (t) {
    case "read":
      return Ra(e, i);
    case "export":
      return Ia(e, i);
    case "import":
      if (r === void 0) throw new Error("kernel:import requires a payload.");
      return Pa(e, i, r);
    case "hydrate":
      if (r === void 0) throw new Error("kernel:hydrate requires a payload.");
      return Da(e, i, r);
    case "replay":
      if (r === void 0) throw new Error("kernel:replay requires a payload.");
      return Oa(e, i, r);
    case "rehydrate":
      if (r === void 0) throw new Error("kernel:rehydrate requires a payload.");
      return Na(e, i, r);
    case "get":
      return ja(e, i);
    case "set":
      if (r === void 0) throw new Error("kernel:set requires a payload.");
      return Ka(e, i, r);
    default:
      throw new Error(`Unsupported kernel operation: ${t}`);
  }
}
function Ra(e, t) {
  switch (t) {
    case "memory":
    case "memories":
    case "logs":
      return X(e.memories);
    case "snapshot":
      return e.exportSnapshot();
    case "mode":
    case "recompute.mode":
      return e.getRecomputeMode();
    default:
      throw new Error(`Unsupported kernel:read path: ${t || "<root>"}`);
  }
}
function Ia(e, t) {
  switch (t) {
    case "memory":
    case "memories":
    case "logs":
      return X(e.memories);
    case "snapshot":
      return e.exportSnapshot();
    default:
      throw new Error(`Unsupported kernel:export path: ${t || "<root>"}`);
  }
}
function Pa(e, t, n) {
  if (t === "snapshot")
    return e.importSnapshot(n ?? {}), e.exportSnapshot();
  throw new Error(`Unsupported kernel:import path: ${t || "<root>"}`);
}
function Da(e, t, n) {
  if (t === "snapshot")
    return e.hydrate(n ?? {}), e.exportSnapshot();
  throw new Error(`Unsupported kernel:hydrate path: ${t || "<root>"}`);
}
function Oa(e, t, n) {
  switch (t) {
    case "memory":
    case "memories":
    case "logs":
      if (!Array.isArray(n)) throw new Error("kernel:replay/memory requires a replayable memory payload.");
      return e.replayMemories(n), X(e.memories);
    default:
      throw new Error(`Unsupported kernel:replay path: ${t || "<root>"}`);
  }
}
function Na(e, t, n) {
  return Da(e, t, n);
}
function ja(e, t) {
  switch (t) {
    case "mode":
    case "recompute.mode":
      return e.getRecomputeMode();
    default:
      throw new Error(`Unsupported kernel:get path: ${t || "<root>"}`);
  }
}
function Ka(e, t, n) {
  switch (t) {
    case "mode":
    case "recompute.mode":
      if (n !== "eager" && n !== "lazy")
        throw new Error(`kernel:set/${t} only accepts "eager" or "lazy".`);
      return e.setRecomputeMode(n), e.getRecomputeMode();
    default:
      throw new Error(`Unsupported kernel:set path: ${t || "<root>"}`);
  }
}
function Va(e, t) {
  if (typeof t == "string") return Fa(t);
  if (!t || typeof t != "object")
    throw new Error("execute(...) requires a me target string or AST.");
  const n = String(t.namespace ?? "").trim(), r = String(t.operation ?? "").trim().toLowerCase(), o = String(t.path ?? "").trim();
  if (!n) throw new Error("Executable me target is missing a namespace.");
  if (!r) throw new Error("Executable me target is missing an operation.");
  return {
    scheme: "me",
    namespace: n,
    operation: r,
    path: o,
    raw: t.raw,
    contextRaw: t.contextRaw ?? null
  };
}
function Fa(e) {
  const t = String(e ?? "").trim();
  if (!t) throw new Error("execute(...) received an empty me target.");
  const n = t.startsWith("me://") ? t.slice(5) : t, r = pa(n, ":");
  if (r < 0)
    throw new Error(`Invalid me target "${t}": expected ":" between namespace and operation.`);
  const o = n.slice(0, r).trim(), i = n.slice(r + 1).trim();
  if (!o) throw new Error(`Invalid me target "${t}": missing namespace.`);
  if (!i) throw new Error(`Invalid me target "${t}": missing operation.`);
  const a = i.indexOf("/"), s = (a >= 0 ? i.slice(0, a) : i).trim().toLowerCase(), c = (a >= 0 ? i.slice(a + 1) : "").trim();
  if (!s) throw new Error(`Invalid me target "${t}": missing operation.`);
  const { namespace: u, contextRaw: f } = Ua(o, t);
  return {
    scheme: "me",
    namespace: u,
    operation: s,
    path: c,
    raw: t,
    contextRaw: f
  };
}
function Ua(e, t) {
  const n = e.indexOf("[");
  if (n < 0)
    return { namespace: e, contextRaw: null };
  const r = e.lastIndexOf("]");
  if (r < n || r !== e.length - 1)
    throw new Error(`Invalid me target "${t}": malformed context segment.`);
  const o = e.slice(0, n).trim(), i = e.slice(n + 1, r).trim();
  if (!o) throw new Error(`Invalid me target "${t}": missing namespace before context.`);
  return { namespace: o, contextRaw: i || null };
}
function ho(e) {
  const n = String(e ?? "").trim().replace(/^\/+|\/+$/g, "").replace(/\//g, ".").split(".").map((o) => o.trim()).filter(Boolean), r = F(n);
  return {
    key: r.join("."),
    parts: r
  };
}
const Tu = 256, Lu = 256, $u = 256, zu = 256, Wu = "this.me/blob/v3", Hu = "this.me/blob/v3/no-noise", qu = "this.me/blob/v4", Gu = "this.me/blob/v4/no-noise";
class Ju extends Error {
  constructor(t = "Identity root is locked; unlock it before deriving v4 keys.") {
    super(t), this.code = "IDENTITY_LOCKED", this.name = "IdentityLockedError";
  }
}
function _e(e, t, n) {
  e.has(t) && e.delete(t), e.set(t, n);
}
function Ta(e, t) {
  for (; e.size > t; ) {
    const n = e.keys().next();
    if (n.done) return;
    e.delete(n.value);
  }
}
function Xu(e) {
  for (; e.v3KeyCache.size > $u; ) {
    const t = e.v3KeyCache.keys().next();
    if (t.done) return;
    const n = e.v3KeyCache.get(t.value);
    n && (n.encKey.fill(0), n.macKey.fill(0), n.pathContext.fill(0)), e.v3KeyCache.delete(t.value);
  }
}
function Yu(e) {
  for (; e.v4KeyCache.size > zu; ) {
    const t = e.v4KeyCache.keys().next();
    if (t.done) return;
    const n = e.v4KeyCache.get(t.value);
    n && (n.encKey.fill(0), n.macKey.fill(0), n.pathContext.fill(0)), e.v4KeyCache.delete(t.value);
  }
}
function re(e) {
  const t = String(e ?? "");
  if (typeof TextEncoder < "u")
    return new TextEncoder().encode(t);
  if (typeof Buffer < "u")
    return new Uint8Array(Buffer.from(t, "utf8"));
  const n = unescape(encodeURIComponent(t)), r = new Uint8Array(n.length);
  for (let o = 0; o < n.length; o++) r[o] = n.charCodeAt(o);
  return r;
}
function Zu(...e) {
  const t = e.reduce((o, i) => o + i.length, 0), n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
function En(e) {
  return re(e.join("."));
}
function La(e, t) {
  let n = null, r = null;
  e.localNoises[""] !== void 0 && (n = "", r = e.localNoises[""]);
  for (let o = 1; o <= t.length; o++) {
    const i = t.slice(0, o).join(".");
    e.localNoises[i] !== void 0 && (n = i, r = e.localNoises[i]);
  }
  return { key: n, value: r };
}
function Qu(e, t) {
  return e === null || e === "" ? !0 : t === e || t.startsWith(e + ".");
}
function lr(e, t, n) {
  return Zu(re(e), new Uint8Array([0]), re(t), new Uint8Array([0]), re(n));
}
function $a(e, t, n) {
  const r = [];
  n.value !== null ? r.push(lr("noise", n.key ?? "", n.value)) : e.localSecrets[""] && r.push(lr("secret", "", e.localSecrets[""]));
  for (let o = 1; o <= t.length; o++) {
    const i = t.slice(0, o).join("."), a = e.localSecrets[i];
    a && Qu(n.key, i) && r.push(lr("secret", i, a));
  }
  return r;
}
function ae(e) {
  e.secretEpoch++, e.scopeCache.clear(), e.compiledEvalMemo?.clear(), e.effectiveSecretCache.clear(), e.decryptedBranchCache.clear(), e.writeBranchCache.clear(), e.decryptedValueCache.clear();
  for (const t of e.v3KeyCache.values())
    t.encKey.fill(0), t.macKey.fill(0), t.pathContext.fill(0);
  e.v3KeyCache.clear();
  for (const t of e.v4KeyCache.values())
    t.encKey.fill(0), t.macKey.fill(0), t.pathContext.fill(0);
  e.v4KeyCache.clear();
}
function oe(e, t) {
  const n = t.join("."), r = e.effectiveSecretCache.get(n);
  if (r && r.epoch === e.secretEpoch)
    return _e(e.effectiveSecretCache, n, r), r.value;
  let o = null, i = null;
  e.localNoises[""] !== void 0 && (o = "", i = e.localNoises[""]);
  for (let c = 1; c <= t.length; c++) {
    const u = t.slice(0, c).join(".");
    e.localNoises[u] !== void 0 && (o = u, i = e.localNoises[u]);
  }
  let a = "root";
  i ? a = pe("noise::" + i) : e.localSecrets[""] && (a = pe(a + "::" + e.localSecrets[""]));
  for (let c = 1; c <= t.length; c++) {
    const u = t.slice(0, c).join(".");
    if (e.localSecrets[u]) {
      if (o !== null && o !== "") {
        const f = o + ".";
        if (!(u === o || u.startsWith(f))) continue;
      }
      a = pe(a + "::" + e.localSecrets[u]);
    }
  }
  const s = a === "root" ? "" : a;
  return _e(e.effectiveSecretCache, n, { epoch: e.secretEpoch, value: s }), Ta(e.effectiveSecretCache, Lu), s;
}
function me(e, t) {
  let n = !1;
  for (const a in e.localSecrets) {
    n = !0;
    break;
  }
  if (!n) {
    let a = e.localSecrets[""] ? [] : null, s = "";
    for (let c = 0; c < t.length; c++) {
      const u = t[c] == null ? "" : String(t[c]);
      s = c === 0 ? u : s + "." + u, e.localSecrets[s] && (a = t.slice(0, c + 1));
    }
    return a;
  }
  const r = t.join("."), o = e.scopeCache.get(r);
  if (o && o.epoch === e.secretEpoch)
    return _e(e.scopeCache, r, o), o.scope ? [...o.scope] : null;
  let i = null;
  e.localSecrets[""] && (i = []);
  for (let a = 1; a <= t.length; a++) {
    const s = t.slice(0, a), c = s.join(".");
    e.localSecrets[c] && (i = s);
  }
  return _e(e.scopeCache, r, { epoch: e.secretEpoch, scope: i ? [...i] : null }), Ta(e.scopeCache, Tu), i;
}
function za(e, t, n) {
  const r = me(e, t);
  if (!r)
    throw new Error(`No secret context active for "${t.join(".")}".`);
  if (n === "branch" && r.length === 0)
    throw new Error("Branch v3 derivation does not support the root secret scope.");
  const o = n === "branch" ? r : t, i = La(e, o), a = i.key === null ? re(Hu) : re(i.key);
  return [
    re(Wu),
    re(n),
    En(r),
    En(o),
    a,
    ...$a(e, o, i)
  ];
}
function Gn(e, t, n) {
  const r = `${n}::${t.join(".")}`, o = e.v3KeyCache.get(r);
  if (o && o.epoch === e.secretEpoch)
    return _e(e.v3KeyCache, r, o), o;
  const i = za(e, t, n), a = ta(i, n, t), s = {
    epoch: e.secretEpoch,
    encKey: Uint8Array.from(a.encKey),
    macKey: Uint8Array.from(a.macKey),
    pathContext: Uint8Array.from(a.pathContext)
  };
  return _e(e.v3KeyCache, r, s), Xu(e), s;
}
function Wa(e, t, n) {
  const r = me(e, t);
  if (!r)
    throw new Error(`No secret context active for "${t.join(".")}".`);
  if (n === "branch" && r.length === 0)
    throw new Error("Branch v4 derivation does not support the root secret scope.");
  const o = n === "branch" ? r : t, i = La(e, o), a = i.key === null ? re(Gu) : re(i.key);
  return [
    re(qu),
    re(n),
    En(r),
    En(o),
    a,
    ...$a(e, o, i)
  ];
}
function po(e, t, n) {
  const r = e.identityRootUnwrapped;
  if (!r || r.length === 0)
    throw new Ju();
  const o = `${n}::${t.join(".")}::${e.identityRootId ?? ""}`, i = e.v4KeyCache.get(o);
  if (i && i.epoch === e.secretEpoch)
    return _e(e.v4KeyCache, o, i), i;
  const a = Wa(e, t, n), s = ro(a, n, t, r), c = {
    epoch: e.secretEpoch,
    encKey: Uint8Array.from(s.encKey),
    macKey: Uint8Array.from(s.macKey),
    pathContext: Uint8Array.from(s.pathContext)
  };
  return _e(e.v4KeyCache, o, c), Yu(e), c;
}
const el = 128;
function tl(e) {
  if (!Array.isArray(e) || e.length < el) return !1;
  const t = [];
  for (let n = 0; n < e.length && t.length < 8; n++)
    e[n] !== void 0 && t.push(e[n]);
  return t.length === 0 ? !1 : t.every((n) => {
    if (!n || typeof n != "object") return !1;
    const r = n.embedding;
    return yo(r) && r.length >= 128 && sl(r);
  });
}
function Ha(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return t.__columnar !== !0 || !t.payload || typeof t.payload != "object" ? !1 : t.payload.meta?.encoding === "columnar";
}
function nl(e) {
  const t = e.length, n = al(e), r = new Uint32Array(t), o = new Float32Array(t * n), i = new Float64Array(t), a = new Array(t), s = {};
  for (let c = 0; c < t; c++) {
    const u = e[c] ?? {};
    r[c] = cl(u.id, c), i[c] = ul(u.timestamp), a[c] = typeof u.text == "string" ? u.text : "";
    const f = yo(u.embedding) ? u.embedding : [];
    for (let h = 0; h < n; h++) {
      const p = f[h];
      o[c * n + h] = typeof p == "number" && Number.isFinite(p) ? p : 0;
    }
    const d = {};
    for (const [h, p] of Object.entries(u))
      h === "id" || h === "embedding" || h === "timestamp" || h === "text" || (d[h] = p);
    Object.keys(d).length > 0 && (s[String(c)] = d);
  }
  return {
    __columnar: !0,
    payload: {
      meta: {
        encoding: "columnar",
        version: 1,
        count: t,
        dims: n
      },
      ids: r,
      embeddings: o,
      timestamps: i,
      texts: a,
      metadata: Object.keys(s).length > 0 ? s : void 0
    }
  };
}
function qa(e, t) {
  if (t < 0 || t >= e.meta.count) return;
  const n = {
    id: e.ids?.[t] ?? t,
    timestamp: e.timestamps?.[t] ?? 0,
    text: e.texts?.[t] ?? ""
  };
  if (e.embeddings && e.meta.dims > 0) {
    const o = t * e.meta.dims, i = o + e.meta.dims;
    n.embedding = Array.from(e.embeddings.subarray(o, i));
  } else
    n.embedding = [];
  const r = e.metadata?.[String(t)];
  return r && Object.assign(n, r), n;
}
function rl(e, t, n) {
  const r = ri(t, 0, e.meta.count), o = ri(n, r, e.meta.count), i = [];
  for (let a = r; a < o; a++) i.push(qa(e, a));
  return i;
}
function ol(e) {
  return {
    __columnar: !0,
    payload: {
      meta: e.payload.meta,
      ids: e.payload.ids ? fr(e.payload.ids, "Uint32Array") : void 0,
      embeddings: e.payload.embeddings ? fr(e.payload.embeddings, "Float32Array") : void 0,
      timestamps: e.payload.timestamps ? fr(e.payload.timestamps, "Float64Array") : void 0,
      texts: e.payload.texts,
      metadata: e.payload.metadata
    }
  };
}
function il(e) {
  if (!e || typeof e != "object")
    throw new Error("Invalid columnar payload");
  const t = e, n = t.meta;
  if (!n || n.encoding !== "columnar" || n.version !== 1)
    throw new Error("Invalid columnar payload metadata");
  return {
    meta: {
      encoding: "columnar",
      version: 1,
      count: oi(n.count),
      dims: oi(n.dims)
    },
    ids: t.ids ? dr(t.ids, Uint32Array, "Uint32Array") : void 0,
    embeddings: t.embeddings ? dr(t.embeddings, Float32Array, "Float32Array") : void 0,
    timestamps: t.timestamps ? dr(t.timestamps, Float64Array, "Float64Array") : void 0,
    texts: Array.isArray(t.texts) ? t.texts.map((r) => typeof r == "string" ? r : "") : void 0,
    metadata: t.metadata && typeof t.metadata == "object" ? t.metadata : void 0
  };
}
function al(e) {
  for (const t of e)
    if (!(!t || typeof t != "object") && yo(t.embedding) && t.embedding.length > 0)
      return t.embedding.length;
  return 0;
}
function yo(e) {
  return Array.isArray(e) || e instanceof Float32Array || e instanceof Float64Array || e instanceof Uint32Array || e instanceof Int32Array || e instanceof Uint16Array || e instanceof Int16Array || e instanceof Uint8Array || e instanceof Int8Array;
}
function sl(e) {
  for (let t = 0; t < e.length; t++) {
    const n = e[t];
    if (typeof n != "number" || !Number.isFinite(n)) return !1;
  }
  return !0;
}
function cl(e, t) {
  const n = typeof e == "number" ? e : t;
  return !Number.isFinite(n) || n < 0 ? t >>> 0 : Math.floor(n) >>> 0;
}
function ul(e) {
  const t = typeof e == "number" ? e : 0;
  return Number.isFinite(t) ? t : 0;
}
function ri(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function oi(e) {
  const t = typeof e == "number" ? e : Number(e);
  return !Number.isFinite(t) || t < 0 ? 0 : Math.floor(t);
}
function fr(e, t) {
  const n = new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  return {
    __typedArray: !0,
    kind: t,
    base64: ll(n)
  };
}
function dr(e, t, n) {
  if (!e || e.__typedArray !== !0 || e.kind !== n)
    throw new Error(`Invalid typed array payload for ${n}`);
  const r = fl(e.base64), o = r.buffer.slice(r.byteOffset, r.byteOffset + r.byteLength);
  return new t(o);
}
function ll(e) {
  if (typeof Buffer < "u")
    return Buffer.from(e).toString("base64");
  let t = "";
  for (const n of e) t += String.fromCharCode(n);
  return btoa(t);
}
function fl(e) {
  if (typeof Buffer < "u")
    return new Uint8Array(Buffer.from(e, "base64"));
  const t = atob(e), n = new Uint8Array(t.length);
  for (let r = 0; r < t.length; r++) n[r] = t.charCodeAt(r);
  return n;
}
const Ga = 64;
function Ja() {
  return {
    calls: 0,
    hits: 0,
    misses: 0,
    v2Misses: 0,
    v3Misses: 0,
    totalHitMs: 0,
    totalMissMs: 0,
    totalDecryptMs: 0,
    totalDecodeMs: 0,
    maxHitMs: 0,
    maxMissMs: 0,
    maxDecryptMs: 0,
    maxDecodeMs: 0
  };
}
function xe() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
function dl(e, t) {
  const n = e.__decryptedChunkDebug;
  if (!n?.enabled) return;
  const r = n.window ?? (n.window = Ja());
  r.calls += 1, r.hits += 1, r.totalHitMs += t, r.maxHitMs = Math.max(r.maxHitMs, t);
}
function ii(e, t, n, r, o) {
  const i = e.__decryptedChunkDebug;
  if (!i?.enabled) return;
  const a = i.window ?? (i.window = Ja());
  a.calls += 1, a.misses += 1, t === "v3" ? a.v3Misses += 1 : a.v2Misses += 1, a.totalMissMs += n, a.totalDecryptMs += r, a.totalDecodeMs += o, a.maxMissMs = Math.max(a.maxMissMs, n), a.maxDecryptMs = Math.max(a.maxDecryptMs, r), a.maxDecodeMs = Math.max(a.maxDecodeMs, o);
}
function yt(e) {
  return Ha(e);
}
function hl(e, t) {
  if (yt(e)) return qa(e.payload, t);
  if (Array.isArray(e)) return e[t];
}
function Xa(e) {
  return yt(e) ? rl(e.payload, 0, e.payload.meta.count) : e;
}
function Ar(e, t, n) {
  e.has(t) && e.delete(t), e.set(t, n);
}
function Ya(e, t) {
  for (; e.size > t; ) {
    const n = e.keys().next();
    if (n.done) return;
    e.delete(n.value);
  }
}
function ct(e, t) {
  return `${e}::${t}`;
}
function He(e, t) {
  const n = `${t}::`;
  for (const r of Array.from(e.decryptedBranchCache.keys()))
    r.startsWith(n) && e.decryptedBranchCache.delete(r);
  for (const r of Array.from(e.writeBranchCache.keys()))
    r.startsWith(n) && e.writeBranchCache.delete(r);
}
function qe(e) {
  if (typeof e != "string" || e.length === 0) return null;
  const t = Number(e);
  return !Number.isInteger(t) || t < 0 ? null : String(t) === e ? t : null;
}
function Mn(e) {
  return qe(e[0]) !== null ? [] : {};
}
function Ze(e, t, n) {
  const r = t.slice(n.length);
  if (r.length === 0) return "root";
  const o = qe(r[0]);
  if (o !== null)
    return `idx_${Math.floor(o / e.secretChunkSize)}`;
  const i = r[0] || "root", a = r[1];
  if (a === void 0) return `${i}_root`;
  const s = qe(a);
  if (s !== null)
    return `${i}_${Math.floor(s / e.secretChunkSize)}`;
  const c = parseInt(pe(String(a)).slice(-6), 16) % e.secretHashBuckets;
  return `${i}_h${c}`;
}
function Jn(e, t, n) {
  const r = t.slice(n.length);
  if (r.length === 0) return r;
  const o = qe(r[0]);
  return o === null ? r : [String(o % e.secretChunkSize), ...r.slice(1)];
}
function pl(e, t, n) {
  const r = t.slice(n.length), o = qe(r[0]);
  return o === null ? null : `${o}_root`;
}
function Xn(e, t, n) {
  if (t.length === 0) return;
  let r = e;
  for (let o = 0; o < t.length - 1; o++) {
    const i = t[o], a = t[o + 1];
    (!r[i] || typeof r[i] != "object") && (r[i] = qe(a) !== null ? [] : {}), r = r[i];
  }
  r[t[t.length - 1]] = n;
}
function mo(e, t, n) {
  if (Z(e) || at(e) || e === null || typeof e != "object" || Array.isArray(e)) {
    n.push({ rel: t, value: e });
    return;
  }
  const r = Object.keys(e);
  if (r.length === 0) {
    n.push({ rel: t, value: e });
    return;
  }
  for (const o of r) mo(e[o], [...t, o], n);
}
function Za(e, t, n, r) {
  const o = t.join("."), i = ao(n, r, t);
  if (!i || typeof i != "object") {
    e.branchStore.setScope(o, { default: n }), He(e, o);
    return;
  }
  const a = [];
  mo(i, [], a);
  const s = {};
  for (const u of a) {
    const f = [...t, ...u.rel], d = Ze(e, f, t), h = Jn(e, f, t);
    (!s[d] || typeof s[d] != "object") && (s[d] = Mn(h)), Xn(s[d], h, u.value);
  }
  const c = {};
  for (const [u, f] of Object.entries(s))
    c[u] = ca(f, r, t);
  e.branchStore.setScope(o, c), He(e, o);
}
function go(e, t, n) {
  const r = t.join("."), o = e.branchStore.getScope(r);
  return o ? typeof o == "string" ? (Za(e, t, o, n), e.branchStore.getScope(r) || {}) : o : {};
}
function Yn(e, t, n) {
  const r = t.join(".");
  return e.branchStore.getChunk(r, n);
}
function bo(e, t, n, r, o) {
  const i = t.join(".");
  e.branchStore.getScopeMode(i) === "legacy" && go(e, t, o), e.branchStore.setChunk(i, n, r), e.decryptedBranchCache.delete(ct(i, n)), e.writeBranchCache.delete(ct(i, n));
}
function yl(e, t, n, r) {
  const o = t.join("."), i = Yn(e, t, n);
  if (!i) return;
  const a = ct(o, n);
  Ar(e.decryptedBranchCache, a, {
    epoch: e.secretEpoch,
    blob: i,
    data: r
  }), Ya(e.decryptedBranchCache, Ga);
}
function he(e, t, n, r) {
  const o = xe(), i = t.join("."), a = Yn(e, t, r);
  if (!a) return;
  const s = ct(i, r), c = e.decryptedBranchCache.get(s);
  if (c && c.epoch === e.secretEpoch && c.blob === a)
    return Ar(e.decryptedBranchCache, s, c), dl(e, xe() - o), c.data;
  const u = ht(a);
  let f = null;
  const d = xe();
  if (u === "v4")
    try {
      const S = po(e, t, "branch");
      f = oo(a, S);
    } catch {
      f = null;
    }
  else if (u === "v3")
    try {
      const S = Gn(e, t, "branch");
      f = io(a, S);
    } catch {
      f = null;
    }
  else
    f = ao(a, n, t);
  const h = xe() - d;
  let p = 0;
  if (!f || typeof f != "object") {
    ii(e, u === "v3" ? "v3" : "v2", xe() - o, h, p);
    return;
  }
  let y;
  if (Ha(f)) {
    const S = xe(), g = il(f.payload);
    p = xe() - S, y = {
      ...f,
      payload: g
    };
  } else
    y = f;
  return Ar(e.decryptedBranchCache, s, { epoch: e.secretEpoch, blob: a, data: y }), Ya(e.decryptedBranchCache, Ga), ii(e, u === "v3" ? "v3" : "v2", xe() - o, h, p), y;
}
function Qa(e, t, n) {
  if (t.startsWith("__ptr.")) {
    const a = e.getIndex(n);
    if (!Z(a)) return { ok: !1 };
    const s = t.slice(6).split(".").filter(Boolean), c = [...a.__ptr.split(".").filter(Boolean), ...s], u = e.readPath(c);
    return u == null ? { ok: !1 } : { ok: !0, value: u };
  }
  const r = t.split(".").filter(Boolean), o = [...n, ...r];
  let i = e.readPath(o);
  return i == null && (i = e.readPath(r)), i == null ? { ok: !1 } : { ok: !0, value: i };
}
const xn = String.raw`[A-Za-z_][A-Za-z0-9_]*(?:\[(?:"[^"]*"|'[^']*'|[^\]]+)\])*`, ml = new RegExp(String.raw`^(?:__ptr(?:\.${xn})*|${xn}(?:\.${xn})*)`), gl = new RegExp(String.raw`^(?:${fo(xn)})`), ai = { true: !0, false: !1, null: null, undefined: void 0, NaN: NaN, Infinity: 1 / 0 }, bl = /* @__PURE__ */ new Set([">=", "<=", "==", "!=", "&&", "||"]), xl = /* @__PURE__ */ new Set(["+", "-", "*", "/", "%", "<", ">", "!"]);
function xo(e) {
  const t = [];
  let n = 0;
  for (; n < e.length; ) {
    const r = e[n];
    if (/\s/.test(r)) {
      n++;
      continue;
    }
    if (r === "(") {
      t.push({ kind: "lparen" }), n++;
      continue;
    }
    if (r === ")") {
      t.push({ kind: "rparen" }), n++;
      continue;
    }
    const o = e.slice(n, n + 2);
    if (bl.has(o)) {
      t.push({ kind: "op", value: o }), n += 2;
      continue;
    }
    if (xl.has(r)) {
      t.push({ kind: "op", value: r }), n++;
      continue;
    }
    if (/\d/.test(r) || r === "." && /\d/.test(e[n + 1] ?? "")) {
      let s = n;
      for (; s < e.length && /[0-9]/.test(e[s]); ) s++;
      if (e[s] === ".")
        for (s++; s < e.length && /[0-9]/.test(e[s]); ) s++;
      if (e[s] === "e" || e[s] === "E") {
        let u = s + 1;
        (e[u] === "+" || e[u] === "-") && u++;
        let f = !1;
        for (; u < e.length && /[0-9]/.test(e[u]); )
          f = !0, u++;
        if (!f) return null;
        s = u;
      }
      const c = Number(e.slice(n, s));
      if (!Number.isFinite(c)) return null;
      t.push({ kind: "literal", value: c }), n = s;
      continue;
    }
    const i = e.slice(n).match(gl);
    if (i && i[0]) {
      const s = pt(i[0]);
      if (s.kind !== "aggregate") return null;
      t.push({ kind: "aggregate", value: i[0], ref: s.ref }), n += i[0].length;
      continue;
    }
    const a = e.slice(n).match(ml);
    if (a && a[0]) {
      if (Pu(a[0])) return null;
      const s = a[0];
      Object.prototype.hasOwnProperty.call(ai, s) ? t.push({ kind: "literal", value: ai[s] }) : t.push({ kind: "identifier", value: s }), n += s.length;
      continue;
    }
    return null;
  }
  return t;
}
function vl(e) {
  const t = String(e ?? "").trim();
  if (!t || !/^[A-Za-z0-9_\s+\-*/%().<>=!&|\[\]"']+$/.test(t)) return !1;
  const n = xo(t);
  if (!n || n.length === 0) return !1;
  let r = "start", o = 0;
  for (const i of n) {
    const a = r === "value" || r === "rparen";
    if (i.kind === "literal" || i.kind === "identifier" || i.kind === "aggregate") {
      if (a) return !1;
      r = "value";
    } else if (i.kind === "lparen") {
      if (a) return !1;
      o++, r = "lparen";
    } else if (i.kind === "rparen") {
      if (!a || o === 0) return !1;
      o--, r = "rparen";
    } else {
      const s = i.value;
      if (s === "!" ? a : !a && s !== "-") return !1;
      r = "op";
    }
  }
  return o === 0 && (r === "value" || r === "rparen");
}
const Sl = 4096, si = /* @__PURE__ */ new WeakMap();
function wl(e, t) {
  const n = e.compiledEvalMemo;
  if (n instanceof Map) return n;
  let r = si.get(e);
  return !r && t && si.set(e, r = /* @__PURE__ */ new Map()), r;
}
function kl(e, t) {
  const n = wl(e, !0), r = n.get(t);
  if (r !== void 0) return r;
  if (n.has(t)) return null;
  const o = El(t);
  return n.size >= Sl && n.clear(), n.set(t, o), o;
}
function El(e) {
  const t = xo(e);
  if (!t || t.length === 0) return null;
  const n = {
    "u-": 7,
    "!": 7,
    "*": 6,
    "/": 6,
    "%": 6,
    "+": 5,
    "-": 5,
    "<": 4,
    "<=": 4,
    ">": 4,
    ">=": 4,
    "==": 3,
    "!=": 3,
    "&&": 2,
    "||": 1
  }, r = /* @__PURE__ */ new Set(["u-", "!"]), o = [], i = [];
  let a = "start";
  for (const s of t) {
    if (s.kind === "literal" || s.kind === "identifier" || s.kind === "aggregate") {
      o.push(s), a = "value";
      continue;
    }
    if (s.kind === "lparen") {
      i.push(s), a = "lparen";
      continue;
    }
    if (s.kind === "rparen") {
      let u = !1;
      for (; i.length > 0; ) {
        const f = i.pop();
        if (f.kind === "lparen") {
          u = !0;
          break;
        }
        o.push(f);
      }
      if (!u) return null;
      a = "rparen";
      continue;
    }
    let c = s.value;
    if (c === "-" && (a === "start" || a === "op" || a === "lparen"))
      c = "u-";
    else {
      if (c === "!" && (a === "value" || a === "rparen"))
        return null;
      if (c !== "!" && (a === "start" || a === "op" || a === "lparen"))
        return null;
    }
    for (; i.length > 0; ) {
      const u = i[i.length - 1];
      if (u.kind !== "op") break;
      const f = n[u.value] ?? -1, d = n[c] ?? -1;
      if (d < 0) return null;
      if (!(r.has(c) ? d < f : d <= f)) break;
      o.push(i.pop());
    }
    i.push({ kind: "op", value: c }), a = "op";
  }
  if (a === "op" || a === "lparen" || a === "start") return null;
  for (; i.length > 0; ) {
    const s = i.pop();
    if (s.kind === "lparen") return null;
    o.push(s);
  }
  for (const s of o) Object.freeze(s);
  return Object.freeze(o);
}
function vo(e, t, n, r) {
  const o = String(n ?? "").trim();
  if (!o) return { ok: !1 };
  if (!/^[A-Za-z0-9_\s+\-*/%().<>=!&|\[\]"']+$/.test(o)) return { ok: !1 };
  if (e.unsafeEval) return { ok: !1 };
  const i = kl(e, o);
  if (!i) return { ok: !1 };
  const a = (u) => {
    if (typeof u == "number" && Number.isFinite(u)) return u;
    if (typeof u == "string") {
      const f = Number(u);
      if (Number.isFinite(f)) return f;
    }
    return null;
  }, s = [];
  for (const u of i) {
    if (u.kind === "literal") {
      s.push(u.value);
      continue;
    }
    if (u.kind === "aggregate") {
      const g = r?.get(u.ref.text);
      if (g === void 0) return { ok: !1 };
      s.push(g);
      continue;
    }
    if (u.kind === "identifier") {
      const g = Qa(e, u.value, t);
      if (!g.ok) return { ok: !1 };
      s.push(g.value);
      continue;
    }
    const f = u.value;
    if (f === "u-" || f === "!") {
      if (s.length < 1) return { ok: !1 };
      const g = s.pop();
      if (f === "u-") {
        const b = a(g);
        if (b === null) return { ok: !1 };
        s.push(-b);
      } else
        s.push(!g);
      continue;
    }
    if (s.length < 2) return { ok: !1 };
    const d = s.pop(), h = s.pop();
    if (f === "&&" || f === "||") {
      s.push(f === "&&" ? !!h && !!d : !!h || !!d);
      continue;
    }
    if (f === "==" || f === "!=") {
      s.push(f === "==" ? h == d : h != d);
      continue;
    }
    if (f === "<" || f === "<=" || f === ">" || f === ">=") {
      const g = a(h), b = a(d);
      if (g === null || b === null) return { ok: !1 };
      f === "<" && s.push(g < b), f === "<=" && s.push(g <= b), f === ">" && s.push(g > b), f === ">=" && s.push(g >= b);
      continue;
    }
    const p = a(h), y = a(d);
    if (p === null || y === null) return { ok: !1 };
    let S;
    if (f === "+") S = p + y;
    else if (f === "-") S = p - y;
    else if (f === "*") S = p * y;
    else if (f === "/") S = p / y;
    else if (f === "%") S = p % y;
    else return { ok: !1 };
    if (!Number.isFinite(S)) return { ok: !1 };
    s.push(S);
  }
  if (s.length !== 1) return { ok: !1 };
  const c = s[0];
  return typeof c == "number" && Number.isFinite(c) ? { ok: !0, value: c } : typeof c == "boolean" ? { ok: !0, value: c } : { ok: !1 };
}
const es = "\0[]";
function Zn(e) {
  return `${e}.${es}`;
}
function mt(e) {
  return e.endsWith(`.${es}`);
}
const Ge = /* @__PURE__ */ new WeakMap(), An = /* @__PURE__ */ new WeakMap(), Cr = /* @__PURE__ */ new WeakMap();
function So(e) {
  const t = e.refSubscribers;
  let n = Cr.get(t);
  if (n === void 0) {
    n = 0;
    for (const r of Object.keys(t)) mt(r) && n++;
    Cr.set(t, n);
  }
  return n;
}
function ts(e, t) {
  const n = e.refSubscribers;
  Cr.set(n, So(e) + t);
}
function Cn(e, t) {
  if (So(e) === 0) return;
  let n = Ge.get(e);
  n || Ge.set(e, n = { keys: /* @__PURE__ */ new Set(), all: !1 }), n.all || n.keys.add(t);
}
function ns(e) {
  if (So(e) === 0) return;
  let t = Ge.get(e);
  t || Ge.set(e, t = { keys: /* @__PURE__ */ new Set(), all: !0 }), t.all = !0, t.keys.clear();
}
function rs(e) {
  const t = Ge.get(e);
  if (!t || !t.all && t.keys.size === 0) return [];
  Ge.delete(e);
  const n = e.refSubscribers, r = /* @__PURE__ */ new Set();
  if (t.all)
    for (const i of Object.keys(n)) mt(i) && r.add(i);
  else
    for (const i of t.keys) {
      let a = i.indexOf(".");
      for (; a !== -1; ) {
        const s = Zn(i.slice(0, a));
        n[s] && r.add(s), a = i.indexOf(".", a + 1);
      }
    }
  const o = [...r];
  for (const i of o) e.refVersions[i] = (e.refVersions[i] ?? 0) + 1;
  if (o.length > 0) {
    const i = An.get(e);
    An.set(e, i ? i.concat(o) : o);
  }
  return o;
}
function ci(e) {
  const t = An.get(e);
  return t ? (An.delete(e), t) : [];
}
function Br(e, t, n, r) {
  return Ba(e, t, n, r);
}
function ui(e, t, n) {
  return {
    label: e.text,
    path: Ma(e),
    kind: "aggregate",
    value: n.value,
    origin: "public",
    masked: !1,
    status: n.status,
    aggregate: {
      collection: We(e.collection),
      field: e.field ? e.field.join(".") : null,
      op: e.op,
      context: t,
      coverage: t,
      status: n.status,
      ...n.reason ? { reason: n.reason } : {},
      members: n.members,
      terms: n.terms,
      domain: n.domain,
      ...n.problems ? { problems: n.problems } : {}
    }
  };
}
const Ml = (e, t) => e.path < t.path ? -1 : e.path > t.path ? 1 : 0;
function _r(e, t, n) {
  const r = [
    ...t.map((c) => ({ path: c, status: "missing" })),
    ...n.filter((c) => c.status !== "resolved").map((c) => ({ path: c.path, status: c.status }))
  ].sort(Ml), o = (c) => [...new Set(c)].sort();
  if (n.some((c) => c.status === "cycle")) return { reason: "cycle", cycle: [e ?? ""] };
  const i = n.filter((c) => c.status === "absent").map((c) => c.path);
  if (t.length > 0 || i.length > 0)
    return { reason: "missing-input", inputs: o([...t, ...i]), causes: r };
  const a = n.filter((c) => c.status === "incomplete").map((c) => c.path);
  if (a.length > 0) return { reason: "incomplete", inputs: o(a), causes: r };
  const s = n.filter((c) => c.status !== "resolved").map((c) => c.path);
  return { reason: "evaluation-failed", inputs: o(s), causes: r };
}
function Al(e, t) {
  const n = e._currentCallerScope;
  if (n === void 0) return !1;
  const r = typeof n == "string" && n.length > 0 ? n : null;
  return !!e.isStealthBlocked?.(t, r);
}
function li(e) {
  return {
    k: e.recomputed.size,
    recomputed: [...e.recomputed].map((t) => ze(t)),
    changed: [...e.changed].map((t) => ze(t)),
    sourcePath: ze(e.sourcePath),
    recomputedAt: e.at
  };
}
function Cl(e, t) {
  const n = String(t ?? "").trim(), r = pt(n);
  if (r.kind === "aggregate") {
    const m = Br(e, r.ref, "public-view"), x = ui(r.ref, "public-view", m), E = m.status === "resolved" ? void 0 : _r(void 0, [], [{ path: x.path, status: m.status }]);
    return {
      path: x.path,
      value: m.value,
      expr: r.ref.text,
      derivation: { expression: r.ref.text, inputs: [x] },
      meta: {
        dependsOn: [x.path],
        ...E ? { unresolved: E } : {}
      }
    };
  }
  if (r.kind === "rejected")
    return {
      path: n,
      value: void 0,
      expr: null,
      derivation: null,
      meta: { dependsOn: [], unresolved: { reason: "evaluation-failed", detail: r.reason } }
    };
  const o = String(t ?? "").split(".").filter(Boolean), i = F(o), a = i.join(".");
  if (e.derivations[a]?.aggregates?.length && Al(e, i))
    return { path: r.kind === "literal" ? We(i) : a, value: void 0, expr: null, derivation: null, meta: { dependsOn: [] } };
  e.recomputeMode === "lazy" && In(e, a);
  const s = r.kind === "literal" ? e.readPath(o) : e.readPath(i), c = r.kind === "literal" ? We(i) : a, u = e.derivations[a], f = e.lastRecomputeWaveByTarget[a];
  if (!u)
    return {
      path: c,
      value: s,
      expr: null,
      derivation: null,
      meta: {
        dependsOn: [],
        ...f ? li(f) : {}
      }
    };
  const d = u.refs.map((m) => ({
    label: m.label,
    path: cs(e, m.label, u.evalScope) ?? m.candidates[0]
  })), h = d.map((m) => {
    const x = F(m.path.split(".").filter(Boolean)), E = me(e, x), C = !!(E && E.length > 0 && Ne(x, E)), D = e.readPath(x);
    return {
      label: m.label,
      path: ze(m.path),
      value: C ? "●●●●" : D,
      origin: C ? "stealth" : "public",
      masked: C,
      status: C ? "masked" : D == null ? "missing" : "resolved"
    };
  }), p = ms(e, a), y = (u.aggregates ?? []).map((m) => ui(m, p, Br(e, m, p, a)));
  h.push(...y);
  const S = new Set(y.map((m) => m.path)), g = (m) => S.has(m) ? m : ze(m), b = u.unresolved, A = b ? b.reason === "cycle" ? { ...b, cycle: b.cycle.map(g) } : {
    ...b,
    ..."inputs" in b && b.inputs ? { inputs: b.inputs.map(g) } : {},
    ..."causes" in b && b.causes ? { causes: b.causes.map((m) => ({ ...m, path: g(m.path) })) } : {}
  } : void 0;
  return {
    path: c,
    value: s,
    expr: u.expression,
    derivation: {
      expression: u.expression,
      inputs: h
    },
    meta: {
      dependsOn: [.../* @__PURE__ */ new Set([...d.map((m) => ze(m.path)), ...y.map((m) => m.path)])],
      lastComputedAt: u.lastComputedAt,
      ...A ? { unresolved: A } : {},
      ...f ? li(f) : {}
    }
  };
}
function os(e, t) {
  return e.activeRecomputeWave ? !1 : (e.activeRecomputeWave = {
    sourcePath: t,
    recomputed: /* @__PURE__ */ new Set(),
    changed: /* @__PURE__ */ new Set(),
    at: Date.now()
  }, !0);
}
function Bl(e, t, n) {
  const r = e.activeRecomputeWave;
  r && (r.recomputed.add(t), n && r.changed.add(t));
}
function rt(e) {
  const t = e.activeRecomputeWave;
  if (!t || (e.activeRecomputeWave = null, t.recomputed.size === 0)) return;
  const n = {
    sourcePath: t.sourcePath,
    recomputed: new Set(t.recomputed),
    changed: new Set(t.changed),
    at: Date.now()
  };
  for (const r of n.recomputed)
    e.lastRecomputeWaveByTarget[r] = n;
}
function is(e) {
  const t = String(e ?? "").trim();
  if (!t) return [];
  const n = /* @__PURE__ */ new Set();
  for (const r of as(t))
    r.aggregate || _l.has(r.text) || n.add(r.text);
  return Array.from(n);
}
const ot = String.raw`[A-Za-z_][A-Za-z0-9_]*(?:\[(?:"[^"]*"|'[^']*'|[^\]]+)\])*`, _l = /* @__PURE__ */ new Set(["true", "false", "null", "undefined", "NaN", "Infinity"]);
function as(e) {
  const t = new RegExp(
    String.raw`(${fo(ot)})|__ptr(?:\.${ot})*|${ot}(?:\.${ot})*`,
    "g"
  ), n = [];
  for (const r of e.matchAll(t)) n.push({ text: r[0], aggregate: r[1] !== void 0 });
  return n;
}
function Rl(e) {
  const t = String(e ?? "");
  if (!t.includes("[")) return !1;
  if (/\.\[\s*(["'])[^"']*[\[\]][^"']*\1\s*\]/.test(t) || /\[\s+\]/.test(t.replace(/"[^"]*"|'[^']*'/g, '""'))) return !0;
  const n = [], r = new RegExp(String.raw`${fo(ot)}`, "g");
  for (const i of t.matchAll(r)) {
    if (pt(i[0]).kind !== "aggregate") return !0;
    n.push([i.index, i.index + i[0].length]);
  }
  let o = null;
  for (let i = 0; i < t.length - 1; i++) {
    const a = t[i];
    if (o) {
      a === o && (o = null);
      continue;
    }
    if (a === '"' || a === "'") {
      o = a;
      continue;
    }
    if (a === "[" && t[i + 1] === "]" && !n.some(([s, c]) => i >= s && i < c)) return !0;
  }
  return !1;
}
function Il(e) {
  const t = String(e ?? "").trim();
  if (!t || !t.includes("[]")) return [];
  const n = [], r = /* @__PURE__ */ new Set();
  for (const o of as(t)) {
    if (!o.aggregate || r.has(o.text)) continue;
    r.add(o.text);
    const i = pt(o.text);
    i.kind === "aggregate" && n.push(i.ref);
  }
  return n;
}
function ss(e, t) {
  if (!e || e.startsWith("__ptr.")) return [];
  const n = F(e.split(".").filter(Boolean));
  if (n.length === 0) return [];
  const r = F([...t, ...n]).join("."), o = F(n).join(".");
  return r === o ? [r] : [r, o];
}
function cs(e, t, n) {
  const r = ss(t, n);
  if (r.length === 0) return null;
  const [o, i] = r;
  if (!i) return o;
  const a = e.readPath(o.split(".").filter(Boolean));
  return a == null ? i : o;
}
function us(e, t) {
  const n = e.readPath(t.split(".").filter(Boolean));
  return n != null;
}
function Pl(e, t, n) {
  const [r, o] = t.candidates;
  return n === r || t.via && t.via[0]?.includes(n) ? !0 : o !== void 0 && (n === o || t.via && t.via[1]?.includes(n)) ? !us(e, r) : !1;
}
function ls(e, t, n) {
  return mt(n) ? !!t.aggregates?.some((r) => Zn(r.collection.join(".")) === n) : t.refs.some((r) => Pl(e, r, n));
}
function Re(e) {
  if (e.refPaths) return e.refPaths;
  const t = /* @__PURE__ */ new Set();
  for (const n of e.refs) {
    for (const r of n.candidates) t.add(r);
    if (n.via) {
      for (const r of n.via) if (r) for (const o of r) t.add(o);
    }
  }
  for (const n of e.aggregates ?? []) t.add(Zn(n.collection.join(".")));
  return e.refPaths = [...t];
}
function Dl(e, t) {
  const n = [];
  let r = t.indexOf(".");
  for (; r !== -1; ) {
    const o = e.refSubscribers[Zn(t.slice(0, r))];
    if (o) for (const i of o) n.push(i);
    r = t.indexOf(".", r + 1);
  }
  return n;
}
const Bn = /* @__PURE__ */ new WeakMap();
function _n(e) {
  const t = e.lastIndexOf(".");
  return t < 0 ? null : e.slice(0, t);
}
function fs(e, t) {
  let n = t, r = _n(n);
  for (; r !== null; ) {
    let o = e.get(r);
    if (!o) e.set(r, o = /* @__PURE__ */ new Set());
    else if (o.has(n)) return;
    o.add(n), n = r, r = _n(n);
  }
}
function Ol(e, t, n) {
  let r = n, o = _n(r);
  for (; o !== null; ) {
    if (e.refSubscribers[r] || t.get(r)?.size) return;
    const i = t.get(o);
    if (!i || (i.delete(r), i.size > 0)) return;
    t.delete(o), r = o, o = _n(r);
  }
}
function Nl(e) {
  let t = Bn.get(e.refSubscribers);
  if (t) return t;
  t = /* @__PURE__ */ new Map();
  for (const n of Object.keys(e.refSubscribers)) fs(t, n);
  return Bn.set(e.refSubscribers, t), t;
}
function ds(e, t, n) {
  let r = e.refSubscribers[t];
  if (!r) {
    mt(t) && ts(e, 1), r = e.refSubscribers[t] = /* @__PURE__ */ new Set();
    const o = Bn.get(e.refSubscribers);
    o && fs(o, t);
  }
  r.add(n);
}
function hs(e, t, n) {
  const r = e.refSubscribers[t];
  if (!r || (r.delete(n), r.size > 0)) return;
  mt(t) && ts(e, -1), delete e.refSubscribers[t];
  const o = Bn.get(e.refSubscribers);
  o && Ol(e, o, t);
}
function jl(e, t) {
  const n = Nl(e), r = [], o = [...n.get(t) || []];
  for (; o.length > 0; ) {
    const i = o.pop();
    e.refSubscribers[i] && r.push(i);
    const a = n.get(i);
    if (a) for (const s of a) o.push(s);
  }
  return r;
}
function ps(e, t) {
  let n;
  for (let r = 0; r < t.candidates.length; r++) {
    const o = t.candidates[r];
    if (!Ks(e, o)) continue;
    const i = pf(e, o.split(".").filter(Boolean)), a = [...new Set(i)].filter((s) => s !== o);
    a.length > 0 && ((n ||= [])[r] = a);
  }
  n ? t.via = n : t.via && delete t.via;
}
function Kl(e, t, n) {
  n.viaStale = !1;
  const r = Re(n);
  for (const a of n.refs) ps(e, a);
  n.refPaths = void 0;
  const o = Re(n), i = new Set(o);
  for (const a of r) i.has(a) || hs(e, a, t);
  for (const a of o) ds(e, a, t);
}
function wo(e, t) {
  const n = e.derivations[t];
  if (n) {
    for (const r of Re(n)) hs(e, r, t);
    delete e.derivations[t], delete e.derivationRefVersions[t], delete e.lastRecomputeWaveByTarget[t], e.staleDerivations.delete(t);
  }
}
function Qn(e, t) {
  return e.refVersions[t] ?? 0;
}
function Rn(e, t) {
  e.refVersions[t] = Qn(e, t) + 1;
}
function ko(e, t) {
  const n = e.derivations[t];
  if (!n) return;
  const r = {};
  for (const o of Re(n)) r[o] = Qn(e, o);
  e.derivationRefVersions[t] = r;
}
function ys(e, t, n, r) {
  const o = t.join(".");
  wo(e, o);
  const i = is(r), a = [];
  for (const u of i) {
    const f = ss(u, n);
    if (f.length === 0) continue;
    const d = { label: u, candidates: f };
    ps(e, d), a.push(d);
  }
  const s = Il(r), c = e.derivations[o] = {
    expression: r,
    evalScope: [...n],
    refs: a,
    lastComputedAt: Date.now(),
    ...s.length > 0 ? { aggregates: s } : {},
    ...Rl(r) ? { rejectedPathForm: !0 } : {}
  };
  for (const u of Re(c)) ds(e, u, o);
  ko(e, o), e.staleDerivations.delete(o);
}
function Eo(e, t, n) {
  if (t.rejectedPathForm) return { value: void 0, unresolved: { reason: "evaluation-failed", detail: "rejected-path-form" } };
  const r = () => {
    const s = [];
    for (const c of t.refs)
      c.candidates.some((u) => us(e, u)) || s.push(c.candidates[0]);
    return s;
  };
  let o;
  if (t.aggregates && t.aggregates.length > 0 && !vl(t.expression))
    return { value: void 0, unresolved: { reason: "evaluation-failed" } };
  if (t.aggregates && t.aggregates.length > 0) {
    const s = ms(e, n), c = t.aggregates.map((u) => ({ ref: u, path: Ma(u), r: Br(e, u, s, n) }));
    if (c.some((u) => u.r.status !== "resolved"))
      return {
        value: void 0,
        unresolved: _r(n, r(), c.map((u) => ({ path: u.path, status: u.r.status })))
      };
    o = new Map(c.map((u) => [u.ref.text, u.r.value]));
  }
  const i = vo(e, t.evalScope, t.expression, o);
  if (i.ok) return { value: i.value };
  const a = r();
  return o ? a.length > 0 ? { value: void 0, unresolved: _r(n, a, []) } : { value: void 0, unresolved: { reason: "evaluation-failed" } } : a.length > 0 ? { value: void 0, unresolved: { reason: "missing-input", inputs: a } } : { value: void 0, unresolved: { reason: "evaluation-failed" } };
}
function ms(e, t) {
  if (t === void 0) return "public-view";
  const n = t.split(".").filter(Boolean);
  for (let r = n.length; r >= 0; r--)
    if (Object.prototype.hasOwnProperty.call(e.localSecrets, n.slice(0, r).join("."))) return "authorized";
  return "public-view";
}
function Vl(e, t) {
  return Object.is(e, t) ? e === null || typeof e != "object" : !1;
}
function Mo(e, t, n, r) {
  const o = e.derivations[t];
  if (!o) return !1;
  o.unresolved = r, o.lastComputedAt = Date.now();
  const i = F(t.split(".").filter(Boolean)), a = "lastValue" in o ? o.lastValue : Fl(e, t, i), s = !Vl(a, n);
  return Bl(e, t, s), s && (e.commitValueMapping(i, n, "="), Rn(e, t), rs(e)), o.lastValue = n, (o.viaStale || o.refs.some((c) => c.via)) && Kl(e, t, o), ko(e, t), e.staleDerivations.delete(t), s;
}
function Rr(e, t) {
  const n = e.derivations[t];
  if (!n) return !1;
  const { value: r, unresolved: o } = Eo(e, n, t);
  return Mo(e, t, r, o);
}
function Ir(e, t) {
  const n = [...t].sort(), r = /* @__PURE__ */ new Set();
  for (const o of n)
    Mo(e, o, void 0, { reason: "cycle", cycle: n }) && r.add(o);
  return r;
}
function gs(e, t) {
  const n = e.derivations[t];
  if (!n) return !1;
  const r = e.derivationRefVersions[t] || {};
  for (const o of Re(n))
    if ((r[o] ?? 0) !== Qn(e, o) && ls(e, n, o)) return !0;
  return !1;
}
const Pr = /* @__PURE__ */ new WeakMap(), fi = /* @__PURE__ */ new WeakMap();
function Fl(e, t, n) {
  let r = Pr.get(e);
  r || Pr.set(e, r = /* @__PURE__ */ new Set()), r.add(t);
  try {
    return e.readPath(n);
  } finally {
    r.delete(t);
  }
}
function In(e, t, n = { stack: [], resolvedAsCycle: /* @__PURE__ */ new Set() }) {
  if (e.recomputeMode !== "lazy") return !1;
  const r = e.derivations[t];
  if (!r) return !1;
  const o = n.stack.indexOf(t);
  if (o >= 0) {
    const f = n.stack.slice(o);
    Ir(e, f);
    for (const d of f) n.resolvedAsCycle.add(d);
    return !1;
  }
  if (n.resolvedAsCycle.has(t) || Pr.get(e)?.has(t)) return !1;
  let i = fi.get(e);
  i || fi.set(e, i = /* @__PURE__ */ new Map());
  const a = i.get(t);
  if (a)
    return a.reentered = !0, !1;
  const s = { reentered: !1 };
  i.set(t, s);
  const c = os(e, t);
  let u = !1;
  try {
    n.stack.push(t);
    for (const d of Re(r))
      e.derivations[d] && In(e, d, n);
    for (const d of r.aggregates ?? [])
      Ca(e, d.collection.join("."), t, (h) => In(e, h, n));
    if (n.stack.pop(), !n.resolvedAsCycle.has(t) && (e.staleDerivations.has(t) || gs(e, t))) {
      const { value: d, unresolved: h } = Eo(e, r, t);
      u = s.reentered ? Ir(e, [t]).size > 0 : Mo(e, t, d, h);
    }
  } finally {
    i.delete(t), c && rt(e);
  }
  return u;
}
function Pn(e, t) {
  bs(e, [F(t).join(".")]);
}
function bs(e, t, n) {
  const r = t.filter(Boolean), o = rs(e);
  if (ci(e), r.length === 0 && o.length === 0) return;
  const i = os(e, r[0] ?? n ?? o[0]);
  for (const m of r) {
    Rn(e, m);
    const x = e.derivations[m];
    x && delete x.lastValue;
  }
  for (const m of o) r.includes(m) || r.push(m);
  let a = null;
  const s = r.length;
  for (let m = 0; m < s; m++) {
    const x = r[m];
    if (Z(e.index[x])) {
      a ||= new Set(r);
      for (const E of [x, ...jl(e, x)]) {
        for (const C of e.refSubscribers[E] || []) {
          const D = e.derivations[C];
          D && (D.viaStale = !0);
        }
        a.has(E) || (a.add(E), r.push(E), Rn(e, E));
      }
    }
  }
  if (e.recomputeMode === "lazy") {
    i && rt(e);
    return;
  }
  const c = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map(), f = [...r], d = (m, x) => {
    const E = u.get(m);
    E ? E.push(x) : u.set(m, [x]), !c.has(x) && (c.add(x), f.push(x));
  };
  for (; f.length > 0; ) {
    const m = f.pop();
    for (const x of e.refSubscribers[m] || []) {
      const E = e.derivations[x];
      !E || !ls(e, E, m) || d(m, x);
    }
    if (e.derivations[m])
      for (const x of Dl(e, m)) e.derivations[x] && d(m, x);
  }
  if (c.size === 0) {
    i && rt(e);
    return;
  }
  let h = !1;
  for (const m of u.keys())
    if (c.has(m)) {
      h = !0;
      break;
    }
  if (!h) {
    for (const m of c) Rr(e, m);
    i && rt(e);
    return;
  }
  const p = /* @__PURE__ */ new Map();
  for (const m of c) p.set(m, 0);
  for (const [m, x] of u)
    if (c.has(m))
      for (const E of x) p.set(E, p.get(E) + 1);
  const y = new Set(r), S = /* @__PURE__ */ new Set(), g = [];
  for (const [m, x] of p) x === 0 && g.push(m);
  const b = (m) => {
    for (const x of u.get(m) || []) {
      if (S.has(x) || !c.has(x)) continue;
      const E = p.get(x) - 1;
      p.set(x, E), E === 0 && g.push(x);
    }
  };
  let A = 0;
  for (; S.size < c.size; ) {
    for (; A < g.length; ) {
      const E = g[A++];
      if (S.has(E)) continue;
      S.add(E);
      const C = e.derivations[E];
      C && Re(C).some((R) => y.has(R)) && Rr(e, E) && y.add(E);
      for (const R of ci(e)) y.add(R);
      b(E);
    }
    if (S.size >= c.size) break;
    const m = [...c].filter((E) => !S.has(E)), x = Ul(m, u);
    if (x.length === 0) break;
    for (const E of x) {
      for (const C of Ir(e, E)) y.add(C);
      for (const C of E) S.add(C);
      for (const C of E) b(C);
    }
  }
  i && rt(e);
}
function Ul(e, t) {
  const n = new Set(e), r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set(), a = [], s = [];
  let c = 0;
  for (const u of e) {
    if (r.has(u)) continue;
    const f = [{ node: u, i: 0 }];
    for (r.set(u, c), o.set(u, c++), a.push(u), i.add(u); f.length > 0; ) {
      const d = f[f.length - 1], h = (t.get(d.node) || []).filter((p) => n.has(p));
      if (d.i < h.length) {
        const p = h[d.i++];
        r.has(p) ? i.has(p) && o.set(d.node, Math.min(o.get(d.node), r.get(p))) : (r.set(p, c), o.set(p, c++), a.push(p), i.add(p), f.push({ node: p, i: 0 }));
        continue;
      }
      if (f.pop(), f.length > 0) {
        const p = f[f.length - 1].node;
        o.set(p, Math.min(o.get(p), o.get(d.node)));
      }
      if (o.get(d.node) === r.get(d.node)) {
        const p = [];
        let y;
        do
          y = a.pop(), i.delete(y), p.push(y);
        while (y !== d.node);
        const S = (t.get(d.node) || []).includes(d.node);
        (p.length > 1 || S) && s.push(p);
      }
    }
  }
  return s;
}
const Dn = /* @__PURE__ */ new WeakMap();
function Tl(e) {
  const t = Dn.get(e.iteratorRules);
  if (t) return t;
  const n = { byPrefix: /* @__PURE__ */ new Map(), ancestors: /* @__PURE__ */ new Set() };
  for (const r of Object.values(e.iteratorRules)) {
    const o = r.prefix.join("."), i = n.byPrefix.get(o);
    i ? i.push(r) : n.byPrefix.set(o, [r]);
    for (let a = 0; a <= r.prefix.length; a++) n.ancestors.add(r.prefix.slice(0, a).join("."));
  }
  return Dn.set(e.iteratorRules, n), n;
}
function Ll(e, t, n) {
  e.iteratorRules[t] = n, Dn.delete(e.iteratorRules);
}
function xs(e, t) {
  const n = t.join(".");
  for (const [r, o] of Object.entries(e.iteratorRules)) {
    const i = o.prefix.join(".");
    (n === "" || i === n || i.startsWith(n + ".")) && (delete e.iteratorRules[r], Dn.delete(e.iteratorRules));
  }
  for (const r of Object.keys(e.derivations))
    (n === "" || r === n || r.startsWith(n + ".")) && wo(e, r);
}
function $l(e, t, n = {}) {
  const { path: r, expression: o } = t, i = qr(r, o);
  if (i)
    return {
      kind: "return",
      value: {
        define: i
      }
    };
  const a = qi(e, r, o);
  if (a)
    return {
      kind: "commit",
      instructions: [{ path: a.scopeKey ? a.scopeKey.split(".").filter(Boolean) : [], op: "secret", value: o }]
    };
  const s = Gr(e, r, o);
  if (s)
    return {
      kind: "commit",
      instructions: [{ path: s.scopeKey ? s.scopeKey.split(".").filter(Boolean) : [], op: "noise", value: o }]
    };
  const c = Gi(e, r, o);
  if (c) {
    const { scope: p } = le(r);
    return {
      kind: "commit",
      instructions: [{ path: p, op: "ptr", value: Pc(c.targetPath) }]
    };
  }
  const u = Ji(e, r, o);
  if (u)
    return {
      kind: "commit",
      instructions: [{ path: u.targetPath, op: "id", value: Dc(u.id) }]
    };
  const f = Yr(e, r, o);
  if (f)
    return {
      kind: "commit",
      instructions: [{ path: f.targetPath, op: "remove", value: "-" }]
    };
  const d = Jr(e, r, o);
  if (d) {
    if (d.mode === "assign")
      return {
        kind: "commit",
        instructions: [
          {
            path: [...d.targetPath, d.name],
            op: "derive",
            value: {
              kind: "expr",
              source: d.expr
            }
          }
        ]
      };
    if (!n.evaluateThunk)
      throw new Error('Non-serializable derivation: "=" thunk requires `evaluateThunk` or serializable DNA.');
    const p = n.evaluateThunk(d.thunk);
    return d.targetPath.length === 0 ? { kind: "return", value: p } : {
      kind: "commit",
      instructions: [{ path: d.targetPath, op: "derive", value: p }]
    };
  }
  const h = Xr(e, r, o);
  if (h) {
    if (!n.readPath)
      return {
        kind: "commit",
        instructions: [
          {
            path: h.targetPath,
            op: "query",
            value: { paths: h.paths }
          }
        ]
      };
    const p = h.paths.map((S) => n.readPath(S.split(".").filter(Boolean))), y = h.fn ? h.fn(...p) : p;
    return h.targetPath.length === 0 ? { kind: "return", value: y } : {
      kind: "commit",
      instructions: [{ path: h.targetPath, op: "query", value: y }]
    };
  }
  return {
    kind: "commit",
    instructions: [{ path: r, op: "set", value: o }]
  };
}
const zl = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom"), di = /* @__PURE__ */ Symbol.for("me.seed"), Dr = /* @__PURE__ */ Symbol.for("me.expression"), On = /* @__PURE__ */ Symbol.for("me.identity"), Ao = /* @__PURE__ */ Symbol.for("me.internal.setActiveExpression"), Or = /* @__PURE__ */ Symbol.for("me.internal.reseed");
function Wl(e) {
  const { effectiveSecret: t, ...n } = e;
  return { ...n };
}
function Co(e) {
  return e.map(Wl);
}
function Hl(e) {
  return { ...e };
}
function vs(e) {
  return e.map(Hl);
}
function ql(e) {
  const t = e._currentCallerScope;
  if (t !== void 0)
    return typeof t == "string" && t.length > 0 ? t : null;
}
function Nr(e, t, n = ql(e)) {
  if (n === void 0) return !1;
  for (let r = t.length; r >= 0; r--) {
    const o = t.slice(0, r).join("."), i = e.localSecrets[o];
    if (typeof i == "string" && i !== n)
      return !0;
    const a = e.index[o];
    if (a && typeof a == "object" && "meta" in a) {
      const s = a.meta;
      if (s?.origin === "stealth" && s.scopeKey !== n)
        return !0;
    }
  }
  return !1;
}
function Nn(e, t) {
  const n = F(t);
  if (n.length === 0) return e.readPath(n);
  if (!Nr(e, n))
    return e.readPath(n);
}
function Bo(e, t) {
  const n = t.findIndex((i) => i.includes("[i]"));
  if (n === -1) return [];
  const r = [];
  for (let i = 0; i <= n; i++) {
    const a = t[i];
    if (i === n) {
      const s = a.split("[i]").join("").trim();
      s && r.push(s);
    } else
      r.push(a);
  }
  const o = /* @__PURE__ */ new Set();
  for (const i of Object.keys(e.index)) {
    const a = i.split(".").filter(Boolean);
    if (a.length <= r.length) continue;
    let s = !0;
    for (let c = 0; c < r.length; c++)
      if (a[c] !== r[c]) {
        s = !1;
        break;
      }
    s && o.add(a[r.length]);
  }
  return Array.from(o).sort((i, a) => {
    const s = Number(i), c = Number(a), u = Number.isFinite(s), f = Number.isFinite(c);
    return u && f ? s - c : u ? -1 : f ? 1 : i.localeCompare(a);
  });
}
function jr(e, t, n) {
  const r = Nn(e, [...t, ...n]);
  return r ?? Nn(e, n);
}
function Kr(e, t, n) {
  const r = F(n.left.split(".").filter(Boolean)), o = jr(e, t, r);
  if (o == null) return !1;
  const i = va(n.right), a = i.kind === "literal" ? i.value : jr(e, t, i.parts);
  return a == null ? !1 : xa(o, n.op, a);
}
function _o(e, t, n) {
  const r = Ye(n);
  if (!r) return !1;
  let o = Kr(e, t, r.clauses[0]);
  for (let i = 1; i < r.clauses.length; i++) {
    const a = Kr(e, t, r.clauses[i]);
    o = r.ops[i - 1] === "&&" ? o && a : o || a;
  }
  return o;
}
function er(e, t) {
  const n = /* @__PURE__ */ new Set();
  for (const r of Object.keys(e.index)) {
    const o = r.split(".").filter(Boolean);
    if (o.length <= t.length) continue;
    let i = !0;
    for (let a = 0; a < t.length; a++)
      if (o[a] !== t[a]) {
        i = !1;
        break;
      }
    i && n.add(o[t.length]);
  }
  return Array.from(n);
}
function Ss(e, t) {
  const n = t.findIndex((u) => {
    const f = Be(u);
    return f ? kn(f.selector) !== null : !1;
  });
  if (n === -1) return;
  const r = Be(t[n]);
  if (!r) return;
  const o = kn(r.selector);
  if (!o) return;
  const i = [...t.slice(0, n), r.base];
  if (t.slice(n + 1).length > 0) return;
  const s = er(e, i), c = {};
  for (const u of s) {
    const f = [...i, u], d = o.expr.replace(
      new RegExp(String.raw`\b${o.varName}\.`, "g"),
      ""
    ), h = vo(e, f, d);
    h.ok && (c[u] = h.value);
  }
  return c;
}
function ws(e, t) {
  const n = t.findIndex((c) => Be(c) !== null);
  if (n === -1) return;
  const r = Be(t[n]);
  if (!r) return;
  const o = lo(r.selector);
  if (o === null) return;
  const i = [...t.slice(0, n), r.base], a = t.slice(n + 1), s = {};
  for (const c of o) {
    const u = [...i, c], f = a.length === 0 ? Ro(e, u) : Nn(e, [...u, ...a]);
    f !== void 0 && (s[c] = f);
  }
  return s;
}
function Ro(e, t) {
  const r = F(t).join("."), o = {};
  let i = !1;
  for (const [a, s] of Object.entries(e.index)) {
    const c = a.split(".").filter(Boolean);
    if (a === r)
      return Nr(e, c) ? void 0 : s;
    if (!a.startsWith(r + ".") || Nr(e, c)) continue;
    const u = a.slice(r.length + 1).split(".").filter(Boolean);
    let f = o;
    for (let d = 0; d < u.length - 1; d++) {
      const h = u[d];
      (!f[h] || typeof f[h] != "object") && (f[h] = {}), f = f[h];
    }
    f[u[u.length - 1]] = s, i = !0;
  }
  return i ? o : void 0;
}
function ks(e, t) {
  const n = t.findIndex((c) => Ye(c) !== null);
  if (n === -1) return;
  const r = t[n], o = t.slice(0, n), i = t.slice(n + 1);
  if (o.length === 0) return;
  const a = er(e, o), s = {};
  for (const c of a) {
    const u = [...o, c];
    _o(e, u, r) && (i.length === 0 ? s[c] = Ro(e, u) : s[c] = Nn(e, [...u, ...i]));
  }
  return s;
}
function Es(e, t) {
  return t.some((n) => {
    const r = Be(n);
    return r ? Ye(r.selector) !== null : !1;
  });
}
function Ms(e, t) {
  const n = t.findIndex((c) => {
    const u = Be(c);
    return u ? Ye(u.selector) !== null : !1;
  });
  if (n === -1) return [];
  const r = Be(t[n]);
  if (!r) return [];
  const o = [...t.slice(0, n), r.base], i = t.slice(n + 1), a = er(e, o), s = [];
  for (const c of a) {
    const u = [...o, c];
    _o(e, u, r.selector) && s.push([...u, ...i]);
  }
  return s;
}
function Io() {
  return {
    writes: 0,
    columnarWrites: 0,
    maxBranchBytes: 0,
    maxCacheSeedBytes: 0,
    maxEncryptableBytes: 0,
    maxBlobBytes: 0,
    totalLoadChunkMs: 0,
    totalMaterializeMs: 0,
    totalCloneMs: 0,
    totalColumnarMaterializeMs: 0,
    totalPrepareColumnarMs: 0,
    totalKeyDeriveMs: 0,
    totalEncryptMs: 0,
    totalSetBlobMs: 0,
    maxLoadChunkMs: 0,
    maxMaterializeMs: 0,
    maxCloneMs: 0,
    maxColumnarMaterializeMs: 0,
    maxPrepareColumnarMs: 0,
    maxKeyDeriveMs: 0,
    maxEncryptMs: 0,
    maxSetBlobMs: 0,
    writeCacheHits: 0,
    writeCacheMisses: 0,
    totalWriteCacheHitMs: 0,
    maxWriteCacheHitMs: 0
  };
}
function W() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
function Le(e, t = /* @__PURE__ */ new WeakSet()) {
  if (e == null) return 0;
  const n = typeof e;
  if (n === "string") return e.length * 2;
  if (n === "number") return 8;
  if (n === "boolean") return 4;
  if (n === "bigint") return 8;
  if (n === "symbol" || n === "function" || n === "undefined") return 0;
  if (typeof Buffer < "u" && Buffer.isBuffer(e) || e instanceof ArrayBuffer || ArrayBuffer.isView(e)) return e.byteLength;
  if (e instanceof Date) return 8;
  if (typeof e == "object") {
    if (t.has(e)) return 0;
    if (t.add(e), Array.isArray(e)) {
      let o = 24;
      for (const i of e) o += Le(i, t);
      return o;
    }
    let r = 32;
    for (const [o, i] of Object.entries(e))
      r += o.length * 2, r += Le(i, t);
    return r;
  }
  return 0;
}
function Gl(e, t, n, r, o, i, a, s, c, u, f) {
  const d = e.__persistSecretBranchDebug;
  if (!d?.enabled) return;
  const h = d.window ?? (d.window = Io()), p = Le(t), y = Le(n), S = Le(r), g = Le(o);
  h.writes += 1, i && (h.columnarWrites += 1), h.maxBranchBytes = Math.max(h.maxBranchBytes, p), h.maxCacheSeedBytes = Math.max(h.maxCacheSeedBytes, y), h.maxEncryptableBytes = Math.max(h.maxEncryptableBytes, S), h.maxBlobBytes = Math.max(h.maxBlobBytes, g), h.totalColumnarMaterializeMs += u, h.totalPrepareColumnarMs += f, h.totalKeyDeriveMs += a, h.totalEncryptMs += s, h.totalSetBlobMs += c, h.maxColumnarMaterializeMs = Math.max(h.maxColumnarMaterializeMs, u), h.maxPrepareColumnarMs = Math.max(h.maxPrepareColumnarMs, f), h.maxKeyDeriveMs = Math.max(h.maxKeyDeriveMs, a), h.maxEncryptMs = Math.max(h.maxEncryptMs, s), h.maxSetBlobMs = Math.max(h.maxSetBlobMs, c);
}
function hi(e, t, n, r) {
  const o = e.__persistSecretBranchDebug;
  if (!o?.enabled) return;
  const i = o.window ?? (o.window = Io());
  i.totalLoadChunkMs += t, i.totalMaterializeMs += n, i.totalCloneMs += r, i.maxLoadChunkMs = Math.max(i.maxLoadChunkMs, t), i.maxMaterializeMs = Math.max(i.maxMaterializeMs, n), i.maxCloneMs = Math.max(i.maxCloneMs, r);
}
function As(e, t, n) {
  e.has(t) && e.delete(t), e.set(t, n);
}
function Jl(e, t) {
  for (; e.size > t; ) {
    const n = e.keys().next();
    if (n.done) return;
    e.delete(n.value);
  }
}
function Xl(e) {
  const t = Number(e.__writeBranchCacheConfig?.limit);
  return Number.isFinite(t) && t > 0 ? Math.floor(t) : 8;
}
function Cs(e) {
  return e.__writeBranchCacheConfig?.enabled === !0;
}
function pi(e, t, n) {
  const r = e.__persistSecretBranchDebug;
  if (!r?.enabled) return;
  const o = r.window ?? (r.window = Io());
  t ? (o.writeCacheHits += 1, o.totalWriteCacheHitMs += n, o.maxWriteCacheHitMs = Math.max(o.maxWriteCacheHitMs, n)) : o.writeCacheMisses += 1;
}
function Yl(e, t, n, r) {
  if (!Cs(e)) return;
  const o = W(), i = `${t.join(".")}::${n}`, a = e.writeBranchCache.get(i);
  if (a && a.epoch === e.secretEpoch && a.blob === r)
    return As(e.writeBranchCache, i, a), pi(e, !0, W() - o), a.data;
  pi(e, !1, 0);
}
function Zl(e, t, n, r, o) {
  if (!Cs(e)) return;
  const i = `${t.join(".")}::${n}`;
  As(e.writeBranchCache, i, {
    epoch: e.secretEpoch,
    blob: r,
    data: o
  }), Jl(e.writeBranchCache, Xl(e));
}
function Ql(e, t, n) {
  const o = ya(t).join(".");
  e.localSecrets[o] = n, e.protectedScopeKeys.add(o), e._ownerScope = n;
}
function ef(e, t) {
  const n = X(t ?? {}), r = String(n.path || "").split(".").filter(Boolean);
  if (n.operator === "_") {
    e.postulate([...r, "_"], typeof n.expression == "string" ? n.expression : "***");
    return;
  }
  if (n.operator === "~") {
    e.postulate([...r, "~"], typeof n.expression == "string" ? n.expression : "***");
    return;
  }
  if (n.operator === "@") {
    const o = n.expression && n.expression.__id || n.value && n.value.__id || n.value;
    typeof o == "string" && o.length > 0 && e.postulate([...r, "@"], o);
    return;
  }
  if (n.operator === "__" || n.operator === "->") {
    const o = n.expression && n.expression.__ptr || n.value && n.value.__ptr || n.value;
    typeof o == "string" && o.length > 0 && e.postulate([...r, "__"], o);
    return;
  }
  if (n.operator === "-") {
    e.removeSubtree(r);
    return;
  }
  if (n.operator === "=" || n.operator === "?") {
    e.postulate(r, n.value, n.operator);
    return;
  }
  Bs(e, r, n.expression, n.operator ?? null, n.value);
}
function tf(e, t) {
  e.localSecrets = {}, e.localNoises = {}, e.protectedScopeKeys.clear(), e.branchStore.clear(), e.keySpaces = {}, e._ownerScope = null, e._currentCallerScope = void 0, ae(e), e.index = {}, e.indexWinner = {}, e.seqCounter = 0, e._memories = [], e.derivations = {}, e.iteratorRules = {}, e.refSubscribers = {}, e.refVersions = {}, e.derivationRefVersions = {}, e.staleDerivations.clear(), e.lastRecomputeWaveByTarget = {}, e.activeRecomputeWave = null;
  for (const n of vs(t || [])) {
    const r = String(n.path || "").split(".").filter(Boolean);
    if (n.operator === "_") {
      e.postulate([...r, "_"], typeof n.expression == "string" ? n.expression : "***");
      continue;
    }
    if (n.operator === "~") {
      e.postulate([...r, "~"], typeof n.expression == "string" ? n.expression : "***");
      continue;
    }
    if (n.operator === "@") {
      const o = n.expression && n.expression.__id || n.value && n.value.__id || n.value;
      typeof o == "string" && o.length > 0 && e.postulate([...r, "@"], o);
      continue;
    }
    if (n.operator === "__" || n.operator === "->") {
      const o = n.expression && n.expression.__ptr || n.value && n.value.__ptr || n.value;
      typeof o == "string" && o.length > 0 && e.postulate([...r, "__"], o);
      continue;
    }
    if (n.operator === "-") {
      e.removeSubtree(r);
      continue;
    }
    if (n.operator === "=" || n.operator === "?") {
      e.postulate(r, n.value, n.operator);
      continue;
    }
    Bs(e, r, n.expression, n.operator, n.value);
  }
  e.rebuildIndex();
}
function Bs(e, t, n, r, o) {
  if (n === we) {
    Je(e, t, r, n, o);
    return;
  }
  e.postulate(t, n, r);
}
function Je(e, t, n, r, o) {
  const i = t.join("."), a = oe(e, t), s = qn(e), c = JSON.stringify({
    path: i,
    operator: n,
    expression: r,
    value: o,
    effectiveSecret: a,
    prevHash: s
  }), u = pe(c), f = Date.now(), d = e.seqCounter++, h = {
    path: i,
    operator: n,
    expression: r,
    value: o,
    effectiveSecret: a,
    hash: u,
    prevHash: s,
    timestamp: f,
    seq: d
  };
  return e._memories.push(h), e.applyMemoryToIndex(h), h;
}
function nf(e) {
  const t = e[0], n = e[e.length - 1], r = e.length > 2 ? e[Math.floor(e.length / 2)] : null;
  return pe(JSON.stringify({
    count: e.length,
    firstId: t?.id ?? null,
    lastId: n?.id ?? null,
    middleId: r?.id ?? null
  }));
}
function rf(e, t, n, r, o) {
  const i = "commitIndexedBatch", a = oe(e, t), s = qn(e), c = Date.now(), u = {
    basePath: t.join("."),
    startIndex: n,
    count: r.length,
    batchHash: nf(r),
    firstId: r[0]?.id ?? null,
    lastId: r[r.length - 1]?.id ?? null
  }, f = JSON.stringify({
    path: i,
    operator: o,
    expression: u,
    value: u,
    effectiveSecret: a,
    prevHash: s
  }), d = pe(f), h = e.seqCounter++, p = {
    path: i,
    operator: o,
    expression: u,
    value: u,
    effectiveSecret: a,
    hash: d,
    prevHash: s,
    timestamp: c,
    seq: h
  };
  return e._memories.push(p), e.applyMemoryToIndex(p), p;
}
function _s(e, t, n, r) {
  let o = {};
  const i = Yn(e, t, r);
  if (i) {
    const d = Yl(e, t, r, i);
    if (d && typeof d == "object") {
      const h = W(), p = X(d), y = W() - h;
      return hi(e, 0, 0, y), p;
    }
  }
  const a = W(), s = he(e, t, n, r), c = W() - a;
  let u = 0, f = 0;
  if (s && typeof s == "object") {
    const d = W(), h = Xa(s);
    if (u = W() - d, h && typeof h == "object") {
      const p = W();
      o = X(h), f = W() - p;
    }
  }
  return hi(e, c, u, f), o;
}
function Rs(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && Object.keys(e).length === 0;
}
function Is(e, t, n, r, o) {
  if (e.secretBlobVersion === "v2")
    return ca(r, o, t);
  if (e.identityRootUnwrapped) {
    const a = po(e, t, n);
    return aa(r, a);
  }
  const i = Gn(e, t, n);
  return sa(r, i);
}
function Po(e, t, n, r, o, i = !0) {
  const a = Array.isArray(o) && tl(o);
  let s = 0, c = 0, u = o, f = o;
  if (a) {
    const A = W();
    u = nl(o), s = W() - A;
    const m = W();
    f = ol(u), c = W() - m;
  }
  let d = 0;
  const h = W(), p = W(), y = Is(e, t, "branch", f, n);
  d = e.secretBlobVersion === "v2" ? 0 : W() - p;
  const S = W() - h, g = W();
  bo(e, t, r, y, n);
  const b = W() - g;
  Zl(e, t, r, y, o), Gl(
    e,
    o,
    u,
    f,
    y,
    a,
    d,
    S,
    b,
    s,
    c
  ), i && yl(e, t, r, u);
}
function of(e, t, n, r, o, i = !0) {
  if (!n || o.length === 0) return;
  let a = _s(e, t, n, r);
  Rs(a) && (a = Mn(o[0]?.rel ?? []));
  for (const { rel: s, value: c } of o) {
    if (s.length === 0) {
      if (typeof a != "object" || a === null) continue;
      a.expression = c;
      continue;
    }
    Xn(a, s, c);
  }
  Po(e, t, n, r, a, i);
}
function af(e, t, n, r, o = null) {
  if (!Array.isArray(r) || r.length === 0) return [];
  const i = /* @__PURE__ */ new Map();
  let a = [];
  for (let c = 0; c < r.length; c++) {
    const u = n + c, f = [...t, String(u)], d = me(e, f);
    if (!d || d.length === 0) {
      Ee(e, f, r[c], o), a.push(f);
      continue;
    }
    const h = oe(e, d);
    if (!h) {
      Ee(e, f, r[c], o), a.push(f);
      continue;
    }
    const p = Ze(e, f, d), y = Jn(e, f, d), S = `${d.join(".")}::${p}`;
    let g = i.get(S);
    g || (g = { scope: d, scopeSecret: h, chunkId: p, relEntries: [] }, i.set(S, g)), g.relEntries.push({ rel: y, value: r[c] }), a.push(f);
  }
  for (const c of i.values())
    of(e, c.scope, c.scopeSecret, c.chunkId, c.relEntries, !1);
  for (const c of a)
    Pn(e, c), Fr(e, c);
  return [rf(e, t, n, r, o ?? "batch_set")];
}
const we = "***";
function sf(e, t) {
  for (const n of e.protectedScopeKeys) {
    const r = n.split(".").filter(Boolean);
    if (Ne(t, r)) return !0;
  }
  for (const n of e.branchStore.listScopes()) {
    const r = n.split(".").filter(Boolean);
    if (r.length !== 0 && Ne(t, r))
      return !0;
  }
  return !1;
}
function Ee(e, t, n, r = null) {
  let o = n, i = n;
  const a = t.join("."), s = oe(e, t), c = me(e, t);
  if (c && c.length === 0 && e.localSecrets[""] && e.localSecrets[a], c && c.length > 0) {
    const u = oe(e, c), f = Jn(e, t, c), d = Ze(e, t, c);
    let h = Mn(f);
    u && (h = _s(e, c, u, d), Rs(h) && (h = Mn(f))), f.length === 0 ? ((typeof h != "object" || h === null) && (h = {}), h.expression = n) : Xn(h, f, n), u && Po(e, c, u, d, h), o = we, i = we;
  } else if (s) {
    const u = r !== "=" && r !== "?";
    Z(n) || at(n) || !u ? o = n : (o = Is(e, t, "value", n, s), i = we);
  } else if (sf(e, t)) {
    const u = Object.prototype.hasOwnProperty.call(e.index, a), f = e.index[a];
    o = we, i = we;
    const d = Je(e, t, r, i, o);
    return u ? e.index[a] = f : delete e.index[a], d;
  } else
    o = n;
  return Je(e, t, r, i, o);
}
function Ps(e, t, n = null) {
  switch (t.op) {
    case "set":
      return Ee(e, t.path, t.value, n);
    case "ptr":
      return Ee(e, t.path, t.value, "__");
    case "id":
      return Ee(e, t.path, t.value, "@");
    case "secret": {
      if (typeof t.value != "string") return;
      const r = ya(t.path);
      return Ql(e, r, t.value), ae(e), Je(e, r, "_", "***", "***");
    }
    default:
      return;
  }
}
function jn(e, t, n, r = null) {
  const o = t, i = qr(o, n);
  if (i) {
    e.operators[i.op] = { kind: i.kind };
    return;
  }
  const { leaf: a } = le(o), s = a ? e.opKind(a) : null;
  if (s === null || s === "secret" || s === "pointer" || s === "identity") {
    const y = $l(e.operators, { path: o, expression: n });
    if (y.kind === "commit") {
      const S = /* @__PURE__ */ new Set(["set", "secret", "ptr", "id"]);
      if (y.instructions.every((b) => S.has(b.op))) {
        let b;
        const A = [];
        for (const m of y.instructions) {
          const x = Ps(e, m, r);
          if (x) {
            if (m.op === "id" && m.path.length === 0 && at(m.value)) {
              const E = e[Ao];
              typeof E == "function" && E(m.value.__id);
            }
            b = x, A.push(x.path.split(".").filter(Boolean));
          }
        }
        if (b) {
          for (const m of A) Pn(e, m);
          for (const m of A) Fr(e, m);
          return b;
        }
      }
    }
  }
  const u = Jr(e.operators, o, n);
  if (u) {
    if (u.mode === "thunk") {
      const g = u.thunk();
      return u.targetPath.length === 0 ? g : jn(e, u.targetPath, g, "=");
    }
    if (ma(u.targetPath)) {
      const g = {
        targetPath: [...u.targetPath],
        prefix: cf(u.targetPath),
        name: u.name,
        expr: u.expr
      };
      Ll(e, uf(g), g);
      let b;
      for (const A of Bo(e, u.targetPath))
        b = Ds(e, g, A);
      return b;
    }
    if (Es(e, u.targetPath)) {
      const g = Ms(e, u.targetPath);
      let b;
      for (const A of g) {
        const m = F(A), x = F([...m, u.name]);
        b = Vr(e, x, m, u.expr);
      }
      return b;
    }
    const y = F([...u.targetPath, u.name]), S = F(u.targetPath);
    return Vr(e, y, S, u.expr);
  }
  const f = Xr(e.operators, o, n);
  if (f) {
    const y = f.paths.map((g) => e.readPath(g.split(".").filter(Boolean))), S = f.fn ? f.fn(...y) : y;
    return f.targetPath.length === 0 ? S : jn(e, f.targetPath, S, "?");
  }
  const d = Yr(e.operators, o, n);
  if (d) {
    e.removeSubtree(d.targetPath);
    return;
  }
  const h = Gr(e.operators, o, n);
  if (h) {
    e.localNoises[h.scopeKey] = n, ae(e);
    const y = h.scopeKey ? h.scopeKey.split(".").filter(Boolean) : [];
    return Je(e, y, "~", "***", "***");
  }
  const p = Ee(e, o, n, r);
  return Pn(e, o), Fr(e, o), p;
}
function cf(e) {
  const t = e.findIndex((o) => o.includes("[i]")), n = e.slice(0, t), r = e[t].split("[i]").join("").trim();
  return r && n.push(r), n;
}
function uf(e) {
  return `${e.targetPath.join(".")}\0${e.name}`;
}
function Ds(e, t, n) {
  const r = F(uo(t.targetPath, n)), o = F([...r, t.name]), i = ga(t.expr, n);
  return Vr(e, o, r, i);
}
function Vr(e, t, n, r) {
  ys(e, t, n, r);
  const o = e.derivations[t.join(".")], { value: i, unresolved: a } = Eo(e, o, t.join("."));
  o.unresolved = a;
  const s = jn(e, t, i, "=");
  return o.lastValue = i, s;
}
function yi(e, t, n) {
  const r = F(uo(t.targetPath, n)), o = F([...r, t.name]).join(".");
  e.derivations[o] || Ds(e, t, n);
}
function Fr(e, t) {
  const { byPrefix: n, ancestors: r } = Tl(e);
  if (n.size === 0) return;
  let o = "";
  for (let i = 0; i < t.length; i++) {
    const a = n.get(o);
    if (a) for (const s of a) yi(e, s, t[i]);
    o = o ? `${o}.${t[i]}` : t[i];
  }
  if (r.has(o)) {
    for (const [i, a] of n)
      if (!(o !== "" && i !== o && !i.startsWith(o + ".")))
        for (const s of a)
          for (const c of Bo(e, s.targetPath)) yi(e, s, c);
  }
}
function lf(e, t) {
  xs(e, t);
  let n = !1;
  const r = t.join(".");
  for (const p of Object.keys(e.localSecrets)) {
    if (r === "") {
      delete e.localSecrets[p], n = !0;
      continue;
    }
    (p === r || p.startsWith(r + ".")) && (delete e.localSecrets[p], n = !0);
  }
  for (const p of Object.keys(e.localNoises)) {
    if (r === "") {
      delete e.localNoises[p], n = !0;
      continue;
    }
    (p === r || p.startsWith(r + ".")) && (delete e.localNoises[p], n = !0);
  }
  n && ae(e);
  for (const p of e.branchStore.listScopes()) {
    if (r === "") {
      e.branchStore.deleteScope(p), He(e, p);
      continue;
    }
    if (p === r || p.startsWith(r + ".")) {
      e.branchStore.deleteScope(p), He(e, p);
      continue;
    }
    const y = p.split(".").filter(Boolean);
    if (!Ne(t, y) || t.length <= y.length) continue;
    const S = oe(e, y);
    if (!S) continue;
    const g = Ze(e, t, y);
    let b = he(e, y, S, g), A = g;
    if (!b && g !== "default" && (b = he(e, y, S, "default"), A = "default"), !b || typeof b != "object") continue;
    b = X(Xa(b));
    const m = t.slice(y.length);
    let x = b;
    for (let E = 0; E < m.length - 1; E++) {
      const C = m[E];
      if (!x || typeof x != "object" || !(C in x)) {
        x = null;
        break;
      }
      x = x[C];
    }
    x && typeof x == "object" && (delete x[m[m.length - 1]], Po(e, y, S, A, b));
  }
  const o = t.join("."), i = Date.now(), a = oe(e, t), s = qn(e), c = JSON.stringify({
    path: o,
    operator: "-",
    expression: "-",
    value: "-",
    effectiveSecret: a,
    prevHash: s
  }), u = pe(c), f = e.seqCounter++, d = {
    path: o,
    operator: "-",
    expression: "-",
    value: "-",
    effectiveSecret: a,
    hash: u,
    prevHash: s,
    timestamp: i,
    seq: f
  };
  e._memories.push(d), e.applyMemoryToIndex(d);
  const h = Object.keys(e.refSubscribers).filter(
    (p) => o === "" || p === o || p.startsWith(o + ".")
  );
  bs(e, h, o);
}
function Os(e, t) {
  const n = typeof e.seq == "number" ? e.seq : null, r = typeof t.seq == "number" ? t.seq : null;
  return n !== null && r !== null ? n !== r ? n - r : e.hash !== t.hash ? e.hash < t.hash ? -1 : 1 : 0 : n === null && r === null ? e.timestamp !== t.timestamp ? e.timestamp - t.timestamp : e.hash !== t.hash ? e.hash < t.hash ? -1 : 1 : 0 : n !== null ? 1 : -1;
}
function Ur(e, t) {
  if (t === "") {
    for (const r of Object.keys(e.indexWinner)) delete e.indexWinner[r];
    return;
  }
  const n = t + ".";
  for (const r of Object.keys(e.indexWinner))
    (r === t || r.startsWith(n)) && delete e.indexWinner[r];
}
function Ns(e, t) {
  const n = t.path, r = n.split(".").filter(Boolean);
  if (t.operator === "_") {
    r.length > 0 && js(e, r);
    return;
  }
  const o = me(e, r), i = o && o.length > 0 && Ne(r, o);
  if (t.operator === "-") {
    if (n === "") {
      for (const u of Object.keys(e.index)) delete e.index[u];
      Ur(e, ""), ns(e);
      return;
    }
    const c = n + ".";
    for (const u of Object.keys(e.index))
      (u === n || u.startsWith(c)) && (delete e.index[u], Cn(e, u));
    Ur(e, n);
    return;
  }
  if (i || t.value === we && t.expression === we) return;
  const a = { timestamp: t.timestamp, seq: t.seq, hash: t.hash }, s = e.indexWinner[n];
  s && Os(a, s) < 0 || (e.index[n] = t.value, e.indexWinner[n] = a, Cn(e, n));
}
function js(e, t) {
  const n = t.join(".");
  if (!n) return;
  const r = n + ".";
  for (const o of Object.keys(e.index))
    (o === n || o.startsWith(r)) && (delete e.index[o], Cn(e, o));
  Ur(e, n);
}
function ff(e) {
  const t = {}, n = e._memories.map((o, i) => ({ t: o, i })).sort((o, i) => {
    const a = Os(o.t, i.t);
    return a !== 0 ? a : o.i - i.i;
  }).map((o) => o.t);
  e.index = t, e.indexWinner = {}, ns(e);
  let r = -1;
  for (const o of e._memories)
    typeof o.seq == "number" && o.seq > r && (r = o.seq);
  e.seqCounter = r + 1;
  for (const o of n)
    Ns(e, o);
}
function ut(e, t) {
  return e.index[t.join(".")];
}
function df(e, t, n) {
  e.index[t.join(".")] = n, Cn(e, t.join("."));
}
function Do(e, t, n = 8, r) {
  let o = t;
  const i = /* @__PURE__ */ new Set();
  for (let a = 0; a < n; a++) {
    const s = ut(e, o);
    if (Z(s)) {
      const u = o.join(".");
      if (i.has(u)) return { path: o, raw: void 0 };
      i.add(u), o = s.__ptr.split(".").filter(Boolean), r && r.push(u, o.join("."));
      continue;
    }
    let c = !1;
    for (let u = o.length - 1; u >= 0; u--) {
      const f = o.slice(0, u), d = ut(e, f);
      if (!Z(d)) continue;
      const h = f.join(".");
      if (i.has(h)) return { path: o, raw: void 0 };
      i.add(h);
      const p = d.__ptr.split(".").filter(Boolean), y = o.slice(u);
      o = [...p, ...y], r && r.push(h, o.join(".")), c = !0;
      break;
    }
    if (!c)
      return { path: o, raw: s };
  }
  return { path: o, raw: void 0 };
}
const hf = 32;
function Ks(e, t) {
  for (; ; ) {
    if (Z(e.index[t])) return !0;
    if (t === "") return !1;
    const n = t.lastIndexOf(".");
    t = n < 0 ? "" : t.slice(0, n);
  }
}
function pf(e, t) {
  if (!Ks(e, t.join("."))) return [];
  const n = [];
  let r = t;
  for (let o = 0; o < hf; o++) {
    const i = me(e, r);
    if (i && i.length > 0 && Ne(r, i) || Z(ut(e, r))) break;
    const a = Do(e, r, 8, n);
    if (a.raw !== void 0 || a.path.length === r.length && a.path.every((c, u) => c === r[u])) break;
    r = a.path;
  }
  return n;
}
function yf(e, t, n) {
  const r = String(t || "").trim();
  if (!r) throw new Error("installRecipientKey(...) requires a recipient key id.");
  return e.recipientKeyring[r] = n, e;
}
function mf(e, t) {
  const n = String(t || "").trim();
  return n && delete e.recipientKeyring[n], e;
}
function gf(e, t, n, r) {
  const o = String(t || "").trim();
  if (!o) throw new Error("storeWrappedKey(...) requires a key id.");
  if (!n || n.version !== 1)
    throw new Error("storeWrappedKey(...) requires a valid WrappedSecretV1 envelope.");
  return e.keySpaces[o] = X({
    envelope: n,
    recipientKeyId: r?.recipientKeyId
  }), e;
}
function Vs(e, t, n, r) {
  switch (t) {
    case "read":
      return n ? Oo(e, n) : X(e.keySpaces);
    case "write":
      if (!n) throw new Error("self:write/keys requires a key id.");
      if (r === void 0) throw new Error("self:write/keys requires a payload.");
      return Us(e, n, r);
    case "open":
    case "use":
      if (!n) throw new Error(`self:${t}/keys requires a key id.`);
      return Ts(e, n, r);
    default:
      throw new Error(`Unsupported keys operation: ${t}`);
  }
}
function Fs(e) {
  const t = String(e ?? "").trim().replace(/^\/+|\/+$/g, "");
  return t ? t === "keys" ? { isKeySpace: !0, keyId: null } : t.startsWith("keys/") ? { isKeySpace: !0, keyId: t.slice(5).trim() || null } : t.startsWith("keys.") ? { isKeySpace: !0, keyId: t.slice(5).trim() || null } : { isKeySpace: !1, keyId: null } : { isKeySpace: !1, keyId: null };
}
function Oo(e, t) {
  const n = e.keySpaces[t];
  if (!n) throw new Error(`Key space "${t}" was not found.`);
  return X(n.envelope);
}
function Us(e, t, n) {
  const r = n && typeof n == "object" && n.envelope ? n.envelope : n, o = n && typeof n == "object" && typeof n.recipientKeyId == "string" ? n.recipientKeyId : void 0;
  return e.storeWrappedKey(t, r, { recipientKeyId: o }), Oo(e, t);
}
function Ts(e, t, n) {
  const r = e.keySpaces[t];
  if (!r) throw new Error(`Key space "${t}" was not found.`);
  const o = n?.output === "utf8" ? "utf8" : "bytes", i = n?.recipientPrivateKey, a = n?.recipientKeyId ?? r.recipientKeyId, s = i ?? (a ? e.recipientKeyring[a] : void 0);
  if (!s)
    throw new Error(
      `No recipient private key is available to open "${t}". Install one first or pass it inline.`
    );
  return ha(r.envelope, s, o);
}
const bf = 2, xf = "***";
function vf(e) {
  const t = Object.values(e);
  return t.length > 0 ? t[t.length - 1] : null;
}
function mi(e) {
  const t = {};
  for (const n of Object.keys(e)) t[n] = xf;
  return t;
}
function Sf(e) {
  return X({
    formatVersion: bf,
    memories: Co(e._memories),
    localSecrets: mi(e.localSecrets),
    localNoises: mi(e.localNoises),
    encryptedBranches: e.branchStore.exportData(),
    keySpaces: e.keySpaces,
    operators: e.operators,
    identityRoot: e.identityRootEnvelope ? e.identityRootEnvelope : null,
    migrationV4: e.migrationV4 ?? {},
    migrationV4Values: e.migrationV4Values ?? {}
  });
}
function No(e, t) {
  const n = X(t ?? {});
  e._memories = Array.isArray(n.memories) ? vs(n.memories) : [], e.localSecrets = n.localSecrets && typeof n.localSecrets == "object" ? n.localSecrets : {}, e.localNoises = n.localNoises && typeof n.localNoises == "object" ? n.localNoises : {}, e._ownerScope = vf(e.localSecrets), e._currentCallerScope = void 0, e.identityRootEnvelope = n.identityRoot && typeof n.identityRoot == "object" ? n.identityRoot : null, e.identityRootId = e.identityRootEnvelope ? e.identityRootEnvelope.rootId : null, e.identityRootUnwrapped && e.identityRootUnwrapped.fill(0), e.identityRootUnwrapped = null, e.migrationV4 = n.migrationV4 && typeof n.migrationV4 == "object" ? n.migrationV4 : {}, e.migrationV4Values = n.migrationV4Values && typeof n.migrationV4Values == "object" ? n.migrationV4Values : {}, ae(e), e.branchStore.importData(
    n.encryptedBranches && typeof n.encryptedBranches == "object" ? n.encryptedBranches : {}
  ), e.keySpaces = n.keySpaces && typeof n.keySpaces == "object" ? n.keySpaces : {}, e.derivations = {}, e.iteratorRules = {}, e.refSubscribers = {}, e.refVersions = {}, e.derivationRefVersions = {}, e.staleDerivations.clear(), e.lastRecomputeWaveByTarget = {}, e.activeRecomputeWave = null;
  const r = Sa();
  e.operators = n.operators && typeof n.operators == "object" ? { ...r, ...n.operators } : r, e.rebuildIndex();
}
function wf(e, t) {
  No(e, t);
}
function kf(e, t) {
  No(e, t);
}
const Ef = 128;
function gi(e, t) {
  let n = e;
  for (const r of t) {
    const o = Number(r);
    if (n && typeof n == "object" && n.__columnar === !0 && Number.isInteger(o) && o >= 0 && String(o) === r) {
      n = hl(n, o);
      continue;
    }
    if (!n || typeof n != "object") return;
    n = n[r];
  }
  return n;
}
function Ls(e, t, n) {
  e.has(t) && e.delete(t), e.set(t, n);
}
function Mf(e, t) {
  for (; e.size > t; ) {
    const n = e.keys().next();
    if (n.done) return;
    e.delete(n.value);
  }
}
function Tr(e) {
  return e && typeof e == "object" ? X(e) : e;
}
function bi(e, t, n) {
  const r = t.join("."), o = e.decryptedValueCache.get(r);
  if (o && o.epoch === e.secretEpoch && o.blob === n)
    return Ls(e.decryptedValueCache, r, o), Tr(o.data);
}
function xi(e, t, n, r) {
  const o = t.join("."), i = Tr(r);
  return Ls(e.decryptedValueCache, o, {
    epoch: e.secretEpoch,
    blob: n,
    data: i
  }), Mf(e.decryptedValueCache, Ef), Tr(i);
}
function Af(e, t) {
  const n = t?.last, r = typeof n == "number" && Number.isFinite(n) && n > 0 ? e._memories.slice(-Math.floor(n)) : e._memories.slice();
  return {
    memories: Co(r),
    index: { ...e.index },
    encryptedScopes: e.branchStore.listScopes(),
    secretScopes: Object.keys(e.localSecrets),
    noiseScopes: Object.keys(e.localNoises),
    recomputeMode: e.recomputeMode,
    staleDerivations: e.staleDerivations.size
  };
}
function Cf(e, t, n, r) {
  const o = Va(e, t);
  switch (o.namespace) {
    case "self":
      return $s(e, o.operation, o.path, n, r);
    case "kernel":
      return _a(e, o.operation, o.path, n);
    default:
      throw new Error(
        `External me target "${o.namespace}" must be resolved by cleaker or monad.ai before reaching the local kernel.`
      );
  }
}
function $s(e, t, n, r, o) {
  const i = Fs(n);
  if (i.isKeySpace)
    return Vs(e, t, i.keyId, r);
  const a = ho(n);
  switch (t) {
    case "read":
      return e.readPath(a.parts);
    case "write":
      if (!a.key) throw new Error("self:write requires a semantic path.");
      if (r === void 0) throw new Error("self:write requires a body payload.");
      return e.postulate(a.parts, r, o ?? null);
    case "inspect":
      return zs(e, a.key);
    case "explain":
      if (!a.key) throw new Error("self:explain requires a semantic path.");
      return e.explain(a.key);
    default:
      throw new Error(`Unsupported self operation: ${t}`);
  }
}
function zs(e, t) {
  const n = e.inspect();
  if (!t) return n;
  const r = (o) => o === t || o.startsWith(t + ".");
  return {
    path: t,
    value: e.readPath(t.split(".").filter(Boolean)),
    memories: n.memories.filter((o) => r(o.path)),
    index: Object.fromEntries(
      Object.entries(n.index).filter(([o]) => r(o))
    ),
    encryptedScopes: n.encryptedScopes.filter(r),
    secretScopes: n.secretScopes.filter(r),
    noiseScopes: n.noiseScopes.filter(r),
    recomputeMode: n.recomputeMode,
    staleDerivations: n.staleDerivations
  };
}
function Bf(e, t) {
  const n = Ss(e, t);
  if (n !== void 0) return n;
  const r = ws(e, t);
  if (r !== void 0) return r;
  const o = F(t);
  if (e.recomputeMode === "lazy") {
    const h = o.join(".");
    e.derivations[h] && e.ensureTargetFresh(h);
  }
  const i = ks(e, o);
  if (i !== void 0) return i;
  const a = me(e, o);
  if (a && a.length > 0 && Ne(o, a)) {
    if (o.length === a.length) return;
    const h = oe(e, a);
    if (!h) return null;
    const p = Ze(e, o, a), y = o.slice(a.length), S = Jn(e, o, a), g = pl(e, o, a);
    let b = he(e, a, h, p), A = S, m = !1;
    if (!b && g && g !== p && (b = he(e, a, h, g), A = y, m = !0), !b && p !== "default" && (b = he(e, a, h, "default")), !b) return;
    let x = gi(b, A);
    if (x === void 0 && g && g !== p && !m) {
      const E = he(e, a, h, g);
      E && (x = gi(E, y));
    }
    return x === void 0 ? void 0 : Z(x) ? e.readPath(x.__ptr.split(".").filter(Boolean)) : at(x) || x && typeof x == "object" ? X(x) : x;
  }
  const s = ut(e, o);
  if (Z(s)) return s;
  const c = Do(e, o), u = c.raw;
  if (u === void 0)
    return c.path.length === o.length && c.path.every((p, y) => p === o[y]) ? void 0 : e.readPath(c.path);
  if (Z(u)) return e.readPath(u.__ptr.split(".").filter(Boolean));
  if (at(u) || !so(u)) return u;
  const f = ht(u);
  if (f === "v4")
    try {
      const h = bi(e, o, u);
      if (h !== void 0) return h;
      const p = po(e, o, "value"), y = oo(u, p);
      return y == null ? y : xi(e, o, u, y);
    } catch {
      return null;
    }
  if (f === "v3")
    try {
      const h = bi(e, o, u);
      if (h !== void 0) return h;
      const p = Gn(e, o, "value"), y = io(u, p);
      return y == null ? y : xi(e, o, u, y);
    } catch {
      return null;
    }
  const d = oe(e, o);
  return d ? ao(u, d, o) : null;
}
function jo() {
  return {
    appendCalls: 0,
    readCalls: 0,
    flushCalls: 0,
    totalRecordStringifyMs: 0,
    totalAppendMs: 0,
    totalReadMs: 0,
    totalFlushMs: 0,
    maxRecordStringifyMs: 0,
    maxAppendMs: 0,
    maxReadMs: 0,
    maxFlushMs: 0,
    maxBlobBytes: 0,
    maxRecordBytes: 0,
    maxAppendResidentBytes: 0,
    maxReadBufferBytes: 0,
    maxReadResidentBytes: 0,
    maxFlushIndexBytes: 0,
    maxAppendHeapDelta: 0,
    maxAppendExternalDelta: 0,
    maxAppendArrayBuffersDelta: 0,
    maxReadHeapDelta: 0,
    maxReadExternalDelta: 0,
    maxReadArrayBuffersDelta: 0,
    maxFlushHeapDelta: 0,
    maxFlushExternalDelta: 0,
    maxFlushArrayBuffersDelta: 0
  };
}
function ve() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const ue = {
  enabled: !1,
  window: jo()
};
function Ue() {
  const e = typeof process < "u" ? process : null, t = e?.memoryUsage;
  if (typeof t != "function")
    return {
      heapUsed: 0,
      external: 0,
      arrayBuffers: 0
    };
  const n = t.call(e);
  return {
    heapUsed: n.heapUsed ?? 0,
    external: n.external ?? 0,
    arrayBuffers: n.arrayBuffers ?? 0
  };
}
function Te(e) {
  const t = String(e ?? "");
  return typeof Buffer < "u" ? Math.max(t.length * 2, Buffer.byteLength(t, "utf8")) : t.length * 2;
}
function de(e, t) {
  return Math.max(0, e - t);
}
function _f(e = !0) {
  ue.enabled = e, ue.window = jo();
}
function Rf() {
  const e = { ...ue.window };
  return ue.window = jo(), e;
}
function vi(e) {
  const n = (typeof process < "u" ? process : null)?.getBuiltinModule;
  if (typeof n == "function")
    return n(e);
}
function Ws(e) {
  return typeof e == "string" ? e : { ...e };
}
function Si(e) {
  const t = {};
  for (const [n, r] of Object.entries(e || {}))
    t[n] = Ws(r);
  return t;
}
function If(e) {
  return Math.max(64, e.length * 2);
}
class Pf {
  constructor(t) {
    this.maxBytes = t, this.entries = /* @__PURE__ */ new Map(), this.usedBytes = 0;
  }
  get(t) {
    const n = this.entries.get(t);
    if (n)
      return this.entries.delete(t), this.entries.set(t, n), n.blob;
  }
  set(t, n) {
    const r = If(n), o = this.entries.get(t);
    o && (this.usedBytes -= o.bytes, this.entries.delete(t)), !(r > this.maxBytes) && (this.trimFor(r), this.entries.set(t, { blob: n, bytes: r }), this.usedBytes += r);
  }
  delete(t) {
    const n = this.entries.get(t);
    n && (this.usedBytes -= n.bytes, this.entries.delete(t));
  }
  deleteByPrefix(t) {
    for (const n of Array.from(this.entries.keys()))
      n.startsWith(t) && this.delete(n);
  }
  clear() {
    this.entries.clear(), this.usedBytes = 0;
  }
  getStats() {
    return {
      entries: this.entries.size,
      usedBytes: this.usedBytes,
      maxBytes: this.maxBytes
    };
  }
  trimFor(t) {
    for (; this.usedBytes + t > this.maxBytes && this.entries.size > 0; ) {
      const n = this.entries.keys().next();
      if (n.done) return;
      this.delete(n.value);
    }
  }
}
class Hs {
  constructor() {
    this.kind = "memory", this.data = {};
  }
  getScope(t) {
    return this.data[t];
  }
  getScopeMode(t) {
    const n = this.data[t];
    return n ? typeof n == "string" ? "legacy" : "chunks" : "none";
  }
  getAuxiliaryPath(t) {
    return null;
  }
  setScope(t, n) {
    this.data[t] = Ws(n);
  }
  deleteScope(t) {
    delete this.data[t];
  }
  listScopes() {
    return Object.keys(this.data);
  }
  getChunk(t, n) {
    const r = this.data[t];
    if (r)
      return typeof r == "string" ? n === "default" ? r : void 0 : r[n];
  }
  setChunk(t, n, r) {
    const o = this.data[t];
    if (!o) {
      this.data[t] = { [n]: r };
      return;
    }
    if (typeof o == "string") {
      const i = { default: o };
      i[n] = r, this.data[t] = i;
      return;
    }
    o[n] = r;
  }
  listChunks(t) {
    const n = this.data[t];
    return n ? typeof n == "string" ? ["default"] : Object.keys(n) : [];
  }
  deleteChunk(t, n) {
    const r = this.data[t];
    if (r) {
      if (typeof r == "string") {
        n === "default" && delete this.data[t];
        return;
      }
      delete r[n], Object.keys(r).length === 0 && delete this.data[t];
    }
  }
  clear() {
    this.data = {};
  }
  exportData() {
    return Si(this.data);
  }
  importData(t) {
    this.data = Si(t);
  }
  view() {
    return this.data;
  }
  close() {
  }
}
class Df {
  constructor(t, n = 4e8) {
    this.kind = "disk", this.index = {}, this.writesSinceFlush = 0;
    const r = typeof t == "string" ? { baseDir: t, maxHotBytes: n } : t, o = vi("node:fs"), i = vi("node:path");
    if (!o || !i)
      throw new Error("DiskStore requires a Node.js runtime.");
    this.fs = o, this.path = i, this.baseDir = r.baseDir, this.logPath = i.join(r.baseDir, "branch-store.log"), this.indexPath = i.join(r.baseDir, "branch-store.index.json"), this.flushEvery = Math.max(1, Math.floor(r.flushEvery ?? 32)), this.hot = new Pf(Math.max(1, Math.floor(r.maxHotBytes ?? 4e8))), o.mkdirSync(this.baseDir, { recursive: !0 }), this.logFd = o.openSync(this.logPath, "a+"), this.logSize = o.fstatSync(this.logFd).size, this.index = this.loadIndex();
  }
  getScope(t) {
    const n = this.index[t];
    if (!n) return;
    if (n.legacy) return this.readBlob(t, "default", n.legacy, "legacy");
    const r = Object.keys(n.chunks);
    if (r.length === 0) return;
    const o = {};
    for (const i of r) {
      const a = n.chunks[i], s = this.readBlob(t, i, a, "chunk");
      s !== void 0 && (o[i] = s);
    }
    return o;
  }
  getScopeMode(t) {
    const n = this.index[t];
    return n ? n.legacy ? "legacy" : "chunks" : "none";
  }
  getAuxiliaryPath(t) {
    return this.path.join(this.baseDir, t);
  }
  setScope(t, n) {
    if (typeof n == "string") {
      this.hot.deleteByPrefix(this.cacheKeyPrefix(t));
      const o = this.appendRecord({ op: "scope:set", scopeKey: t, value: n });
      this.index[t] = { legacy: o, chunks: {} }, this.hot.set(this.cacheKey(t, "default", "legacy"), n), this.maybeFlushIndex();
      return;
    }
    delete this.index[t], this.hot.deleteByPrefix(this.cacheKeyPrefix(t));
    const r = { legacy: null, chunks: {} };
    this.index[t] = r;
    for (const [o, i] of Object.entries(n)) {
      const a = this.appendRecord({ op: "chunk:set", scopeKey: t, chunkId: o, blob: i });
      r.chunks[o] = a, this.hot.set(this.cacheKey(t, o, "chunk"), i);
    }
    this.maybeFlushIndex();
  }
  deleteScope(t) {
    this.index[t] && (this.appendRecord({ op: "scope:delete", scopeKey: t }), delete this.index[t], this.hot.deleteByPrefix(this.cacheKeyPrefix(t)), this.maybeFlushIndex());
  }
  listScopes() {
    return Object.keys(this.index);
  }
  getChunk(t, n) {
    const r = this.index[t];
    if (!r) return;
    if (r.legacy)
      return n !== "default" ? void 0 : this.readBlob(t, n, r.legacy, "legacy");
    const o = r.chunks[n];
    if (o)
      return this.readBlob(t, n, o, "chunk");
  }
  setChunk(t, n, r) {
    let o = this.index[t];
    o || (o = { legacy: null, chunks: {} }, this.index[t] = o), o.legacy && (o.chunks.default = o.legacy, o.legacy = null);
    const i = this.appendRecord({ op: "chunk:set", scopeKey: t, chunkId: n, blob: r });
    o.chunks[n] = i, this.hot.set(this.cacheKey(t, n, "chunk"), r), this.maybeFlushIndex();
  }
  listChunks(t) {
    const n = this.index[t];
    return n ? n.legacy ? ["default"] : Object.keys(n.chunks) : [];
  }
  deleteChunk(t, n) {
    const r = this.index[t];
    if (!r) return;
    const o = r.legacy && n === "default" ? "legacy" : "chunk";
    this.appendRecord({ op: "chunk:delete", scopeKey: t, chunkId: n }), r.legacy && n === "default" ? r.legacy = null : delete r.chunks[n], !r.legacy && Object.keys(r.chunks).length === 0 && delete this.index[t], this.hot.delete(this.cacheKey(t, n, o)), this.maybeFlushIndex();
  }
  clear() {
    this.index = {}, this.hot.clear(), this.writesSinceFlush = 0, this.fs.closeSync(this.logFd), this.fs.writeFileSync(this.logPath, "", "utf8"), this.fs.writeFileSync(this.indexPath, "{}", "utf8"), this.logFd = this.fs.openSync(this.logPath, "a+"), this.logSize = 0;
  }
  exportData() {
    const t = {};
    for (const n of this.listScopes()) {
      const r = this.getScope(n);
      r !== void 0 && (t[n] = r);
    }
    return t;
  }
  importData(t) {
    this.clear();
    for (const [n, r] of Object.entries(t || {}))
      this.setScope(n, r);
    this.flushIndex();
  }
  view() {
    return this.exportData();
  }
  close() {
    this.flushIndex(), this.fs.closeSync(this.logFd);
  }
  getHotStats() {
    return this.hot.getStats();
  }
  getIndexStats() {
    const t = Object.keys(this.index);
    let n = 0, r = 0;
    for (const o of t) {
      const i = this.index[o];
      if (!i) continue;
      i.legacy && (r += 1);
      const a = Object.keys(i.chunks || {});
      n += a.length, r += a.length;
    }
    return {
      scopes: t.length,
      chunks: n,
      pointers: r
    };
  }
  loadIndex() {
    if (!this.fs.existsSync(this.indexPath)) return this.rebuildIndexFromLog();
    try {
      const t = JSON.parse(this.fs.readFileSync(this.indexPath, "utf8"));
      return t && typeof t == "object" ? t : {};
    } catch {
      return this.rebuildIndexFromLog();
    }
  }
  rebuildIndexFromLog() {
    if (!this.fs.existsSync(this.logPath)) return {};
    const t = this.fs.readFileSync(this.logPath, "utf8"), n = {};
    let r = 0;
    for (const o of t.split(`
`)) {
      const i = Buffer.byteLength(o + `
`), a = o.trim();
      if (!a) {
        r += i;
        continue;
      }
      try {
        const s = JSON.parse(a), c = { offset: r, length: i };
        this.applyRecord(n, s, c);
      } catch {
      }
      r += i;
    }
    return n;
  }
  appendRecord(t) {
    const n = ue.enabled, r = n ? Ue() : null, o = n ? ve() : 0, i = t.op === "scope:set" ? Te(t.value) : t.op === "chunk:set" ? Te(t.blob) : 0, a = n ? ve() : 0, s = `${JSON.stringify(t)}
`, c = n ? ve() - a : 0, u = Buffer.byteLength(s), f = {
      offset: this.logSize,
      length: u
    };
    if (this.fs.writeSync(this.logFd, s), this.logSize += u, n && r) {
      const d = Ue(), h = ve() - o, p = Te(s), y = ue.window;
      y.appendCalls += 1, y.totalRecordStringifyMs += c, y.totalAppendMs += h, y.maxRecordStringifyMs = Math.max(y.maxRecordStringifyMs, c), y.maxAppendMs = Math.max(y.maxAppendMs, h), y.maxBlobBytes = Math.max(y.maxBlobBytes, i), y.maxRecordBytes = Math.max(y.maxRecordBytes, p), y.maxAppendResidentBytes = Math.max(y.maxAppendResidentBytes, i + p), y.maxAppendHeapDelta = Math.max(y.maxAppendHeapDelta, de(d.heapUsed, r.heapUsed)), y.maxAppendExternalDelta = Math.max(y.maxAppendExternalDelta, de(d.external, r.external)), y.maxAppendArrayBuffersDelta = Math.max(
        y.maxAppendArrayBuffersDelta,
        de(d.arrayBuffers, r.arrayBuffers)
      );
    }
    return f;
  }
  applyRecord(t, n, r) {
    switch (n.op) {
      case "scope:set":
        t[n.scopeKey] = { legacy: r, chunks: {} };
        return;
      case "scope:delete":
        delete t[n.scopeKey];
        return;
      case "chunk:set": {
        const o = t[n.scopeKey] || { legacy: null, chunks: {} };
        o.legacy && (o.chunks.default = o.legacy, o.legacy = null), o.chunks[n.chunkId] = r, t[n.scopeKey] = o;
        return;
      }
      case "chunk:delete": {
        const o = t[n.scopeKey];
        if (!o) return;
        o.legacy && n.chunkId === "default" ? o.legacy = null : delete o.chunks[n.chunkId], !o.legacy && Object.keys(o.chunks).length === 0 && delete t[n.scopeKey];
      }
    }
  }
  flushIndex() {
    const t = ue.enabled, n = t ? Ue() : null, r = t ? ve() : 0, o = JSON.stringify(this.index);
    if (this.fs.writeFileSync(this.indexPath, o, "utf8"), t && n) {
      const i = Ue(), a = ve() - r, s = ue.window;
      s.flushCalls += 1, s.totalFlushMs += a, s.maxFlushMs = Math.max(s.maxFlushMs, a), s.maxFlushIndexBytes = Math.max(s.maxFlushIndexBytes, Te(o)), s.maxFlushHeapDelta = Math.max(s.maxFlushHeapDelta, de(i.heapUsed, n.heapUsed)), s.maxFlushExternalDelta = Math.max(s.maxFlushExternalDelta, de(i.external, n.external)), s.maxFlushArrayBuffersDelta = Math.max(
        s.maxFlushArrayBuffersDelta,
        de(i.arrayBuffers, n.arrayBuffers)
      );
    }
    this.writesSinceFlush = 0;
  }
  maybeFlushIndex() {
    this.writesSinceFlush += 1, this.writesSinceFlush >= this.flushEvery && this.flushIndex();
  }
  readBlob(t, n, r, o) {
    const i = this.cacheKey(t, n, o), a = this.hot.get(i);
    if (a !== void 0) return a;
    const s = ue.enabled, c = s ? Ue() : null, u = s ? ve() : 0, f = Buffer.alloc(r.length);
    this.fs.readSync(this.logFd, f, 0, r.length, r.offset);
    const d = f.toString("utf8").trim();
    if (!d) return;
    const h = JSON.parse(d), p = h.op === "scope:set" ? h.value : h.op === "chunk:set" ? h.blob : void 0;
    if (p !== void 0) {
      if (this.hot.set(i, p), s && c) {
        const y = Ue(), S = ve() - u, g = Te(p), b = ue.window;
        b.readCalls += 1, b.totalReadMs += S, b.maxReadMs = Math.max(b.maxReadMs, S), b.maxBlobBytes = Math.max(b.maxBlobBytes, g), b.maxReadBufferBytes = Math.max(b.maxReadBufferBytes, r.length), b.maxReadResidentBytes = Math.max(
          b.maxReadResidentBytes,
          r.length + Te(d) + g
        ), b.maxReadHeapDelta = Math.max(b.maxReadHeapDelta, de(y.heapUsed, c.heapUsed)), b.maxReadExternalDelta = Math.max(b.maxReadExternalDelta, de(y.external, c.external)), b.maxReadArrayBuffersDelta = Math.max(
          b.maxReadArrayBuffersDelta,
          de(y.arrayBuffers, c.arrayBuffers)
        );
      }
      return p;
    }
  }
  cacheKey(t, n, r) {
    return `${t}::${r}::${n}`;
  }
  cacheKeyPrefix(t) {
    return `${t}::`;
  }
}
function Of(e = {}) {
  return {
    memory: {
      index: {},
      indexWinner: {},
      seqCounter: 0,
      _memories: []
    },
    secrets: {
      localSecrets: {},
      localNoises: {},
      protectedScopeKeys: /* @__PURE__ */ new Set(),
      branchStore: e.store ?? new Hs(),
      secretBlobVersion: "v3",
      keySpaces: {},
      recipientKeyring: {},
      secretEpoch: 0,
      scopeCache: /* @__PURE__ */ new Map(),
      compiledEvalMemo: /* @__PURE__ */ new Map(),
      effectiveSecretCache: /* @__PURE__ */ new Map(),
      decryptedBranchCache: /* @__PURE__ */ new Map(),
      writeBranchCache: /* @__PURE__ */ new Map(),
      decryptedValueCache: /* @__PURE__ */ new Map(),
      v3KeyCache: /* @__PURE__ */ new Map(),
      v4KeyCache: /* @__PURE__ */ new Map(),
      vectorIndexes: /* @__PURE__ */ new Map(),
      secretChunkSize: 256,
      secretHashBuckets: 16,
      identityRootEnvelope: null,
      identityRootUnwrapped: null,
      identityRootId: null,
      migrationV4: {},
      migrationV4Values: {}
    },
    derivation: {
      derivations: {},
      iteratorRules: {},
      refSubscribers: {},
      recomputeMode: "eager",
      refVersions: {},
      derivationRefVersions: {},
      staleDerivations: /* @__PURE__ */ new Set(),
      lastRecomputeWaveByTarget: {},
      activeRecomputeWave: null
    },
    config: {
      unsafeEval: !1,
      operators: Sa()
    }
  };
}
function Nf(e = {}) {
  const t = Of(e);
  return {
    ...t.memory,
    ...t.secrets,
    ...t.derivation,
    ...t.config
  };
}
function jf(e) {
  const t = [];
  let n = "", r = 0, o = null;
  for (let a = 0; a < e.length; a++) {
    const s = e[a];
    if (o) {
      n += s, s === o && (o = null);
      continue;
    }
    if (s === '"' || s === "'") {
      o = s, n += s;
      continue;
    }
    if (s === "[") {
      r++, n += s;
      continue;
    }
    if (s === "]") {
      r = Math.max(0, r - 1), n += s;
      continue;
    }
    if (s === "." && r === 0) {
      const c = n.trim();
      c && t.push(c), n = "";
      continue;
    }
    n += s;
  }
  const i = n.trim();
  return i && t.push(i), t;
}
function Kf(e, t, n) {
  if (t.length === 0) {
    if (n.length === 1 && typeof n[0] == "string") {
      const f = n[0].trim(), d = pt(f);
      if ((d.kind === "aggregate" || d.kind === "rejected") && e.readPathExpression)
        return e.readPathExpression(d, f);
      const h = f.startsWith("_") || f.startsWith("~") || f.startsWith("@"), p = f.includes("."), y = /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(f);
      if (p || h || y)
        return e.readPath(jf(f));
    }
    if (n.length === 2 && typeof n[0] == "string" && typeof n[1] == "string") {
      const f = n[0].trim(), d = n[1].trim();
      if (/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(f) && f && d)
        return e.reseedIdentity?.(f, d), e.createProxy([]);
    }
    if (n.length === 0)
      return e.createProxy([]);
    const c = e.normalizeArgs(n), u = e.postulate([], c);
    return u !== void 0 ? u : e.createProxy([]);
  }
  const r = e.normalizeArgs(n), o = e.postulate(t, r), { scope: i, leaf: a } = e.splitPath(t), s = a ? e.opKind(a) : null;
  if (e.isMemory(o)) {
    const c = s ? i : t;
    return e.createProxy(c);
  }
  return o !== void 0 ? o : e.createProxy(t);
}
const Ko = "!";
function Lr(e, t, n) {
  const r = e._currentCallerScope;
  e._currentCallerScope = t;
  try {
    return n();
  } finally {
    e._currentCallerScope = r;
  }
}
function qs(e) {
  return e._currentCallerScope;
}
function Vf(e) {
  if (e.length !== 0)
    return e.length === 1 ? e[0] : e;
}
function Q(e, t, n, r, o) {
  return {
    kind: "method",
    path: t,
    docs: r,
    signature: o,
    call: n
  };
}
function Gs(e) {
  return {
    docs: {
      kind: "runtime-surface",
      description: "Reflective runtime plane for .me. Use me['!'] to access inspection, replay, snapshots, identity, and kernel controls.",
      namespaces: ["inspect", "explain", "identity", "currentExpression", "prove", "memories", "snapshot", "runtime", "methods"]
    },
    inspect: Q(
      e,
      "inspect",
      (t) => e.inspect(t),
      "Return a debug snapshot of memories, index, scopes, and recompute state.",
      "inspect(opts?: { last?: number }): { memories, index, encryptedScopes, secretScopes, noiseScopes, recomputeMode, staleDerivations }"
    ),
    explain: Q(
      e,
      "explain",
      (t) => e.explain(t),
      "Explain how a derived value was computed, including dependency inputs and masking for stealth sources.",
      "explain(path: string): { path, value, expr, derivation, meta }"
    ),
    identity: Q(
      e,
      "identity",
      () => e[On],
      "Return the deterministic seed-derived identity hash together with the current active expression.",
      "identity(): { hash: string, expression: string | null }"
    ),
    currentExpression: Q(
      e,
      "currentExpression",
      () => e[Dr],
      "Return the current active expression selected by the root identity operator.",
      "currentExpression(): string | null"
    ),
    prove: Q(
      e,
      "prove",
      (t) => e.prove(t),
      "Derive a branch-scoped Ed25519 proof for the current active expression and root namespace.",
      "prove(input: { rootNamespace: string, challenge?: string | null }): Promise<{ identityHash, expression, namespace, rootNamespace, publicKey, message, signature, timestamp }>"
    ),
    memories: {
      docs: "Memory log helpers and replay controls.",
      list: Q(
        e,
        "memories.list",
        () => e.memories,
        "Return the current memory log.",
        "memories.list(): Memory[]"
      ),
      replay: Q(
        e,
        "memories.replay",
        (t) => e.replayMemories(t),
        "Reset kernel state and replay a public or legacy memory log into the current kernel.",
        "memories.replay(memories: ReplayMemoryInput[]): void"
      )
    },
    snapshot: {
      docs: "Snapshot import/export helpers for full kernel state. Prefer hydrate() to restore a saved kernel.",
      export: Q(
        e,
        "snapshot.export",
        () => e.exportSnapshot(),
        "Export the current kernel snapshot with public memories plus secrets, noises, encrypted branches, key spaces, and operators.",
        "snapshot.export(): Snapshot"
      ),
      hydrate: Q(
        e,
        "snapshot.hydrate",
        (t) => e.hydrate(t),
        "Primary restore API. Bring a saved kernel snapshot back to life in the current runtime.",
        "snapshot.hydrate(snapshot: Snapshot): void"
      ),
      import: Q(
        e,
        "snapshot.import",
        (t) => e.importSnapshot(t),
        "Compatibility alias for snapshot.hydrate() that preserves the older import-oriented naming.",
        "snapshot.import(snapshot: Snapshot): void"
      ),
      rehydrate: Q(
        e,
        "snapshot.rehydrate",
        (t) => e.rehydrate(t),
        "Backward-compatible alias for snapshot.hydrate() with the older rehydrate naming.",
        "snapshot.rehydrate(snapshot: Snapshot): void"
      )
    },
    runtime: {
      docs: "Kernel execution and recomputation controls.",
      getRecomputeMode: Q(
        e,
        "runtime.getRecomputeMode",
        () => e.getRecomputeMode(),
        "Return the current recomputation mode.",
        "runtime.getRecomputeMode(): 'eager' | 'lazy'"
      ),
      setRecomputeMode: Q(
        e,
        "runtime.setRecomputeMode",
        (t) => e.setRecomputeMode(t),
        "Set recomputation mode for derivations.",
        "runtime.setRecomputeMode(mode: 'eager' | 'lazy'): this"
      )
    },
    methods: {
      docs: "Self-described method registry for the runtime surface.",
      inspect: null,
      explain: null,
      identity: null,
      currentExpression: null,
      prove: null,
      exportSnapshot: null,
      hydrate: null,
      importSnapshot: null,
      rehydrate: null,
      replayMemories: null,
      getRecomputeMode: null,
      setRecomputeMode: null
    }
  };
}
function Js() {
  return {
    kind: "runtime-surface",
    escape: Ko,
    description: "Use me['!'] to enter the reflective runtime plane. This plane exposes snapshots, replay, explainability, and kernel controls.",
    namespaces: ["inspect", "explain", "identity", "currentExpression", "prove", "memories", "snapshot", "runtime", "methods"]
  };
}
function $r(e, t) {
  const n = Gs(e);
  if (n.methods.inspect = n.inspect, n.methods.explain = n.explain, n.methods.identity = n.identity, n.methods.currentExpression = n.currentExpression, n.methods.prove = n.prove, n.methods.exportSnapshot = n.snapshot.export, n.methods.hydrate = n.snapshot.hydrate, n.methods.importSnapshot = n.snapshot.import, n.methods.rehydrate = n.snapshot.rehydrate, n.methods.replayMemories = n.memories.replay, n.methods.getRecomputeMode = n.runtime.getRecomputeMode, n.methods.setRecomputeMode = n.runtime.setRecomputeMode, t.length === 0) return n;
  let r = n;
  for (const o of t) {
    if (r == null) return;
    r = r[o];
  }
  return r;
}
function Kn(e, t, n = qs(e)) {
  const r = (...o) => Lr(e, n, () => {
    const i = $r(e, t);
    return typeof i == "function" ? i(...o) : i && typeof i == "object" && typeof i.call == "function" ? i.call(...o) : t.length === 0 && o.length === 0 ? e[On] : t.length === 0 ? Js() : i;
  });
  return new Proxy(r, {
    get(o, i) {
      if (typeof i == "symbol") return o[i];
      const a = String(i), s = [...t, a], c = $r(e, s);
      if (c !== void 0)
        return c === null ? null : Array.isArray(c) ? c : typeof c == "function" || typeof c == "object" ? Kn(e, s, n) : c;
    },
    apply(o, i, a) {
      return Reflect.apply(o, void 0, a);
    }
  });
}
function zr(e, t, n = qs(e)) {
  const r = (...o) => Lr(
    e,
    n,
    () => Kf(
      {
        createProxy: (i) => zr(e, i, n),
        normalizeArgs: (i) => e.normalizeArgs(i),
        readPath: (i) => e.readPath(i),
        readPathExpression: (i, a) => e.readPathExpression(i, a),
        postulate: (i, a) => e.postulate(i, a),
        opKind: (i) => e.opKind(i),
        splitPath: le,
        isMemory: Oc,
        reseedIdentity: (i, a) => e[Or]?.(i, a),
        setActiveExpression: (i) => e[Ao]?.(i)
      },
      t,
      o
    )
  );
  return new Proxy(r, {
    get(o, i) {
      if (typeof i == "symbol") return o[i];
      if (i === Ko)
        return Kn(e, [], n);
      if (i in e) {
        const s = e[i];
        return typeof s == "function" ? (...c) => Lr(e, n, () => s.apply(e, c)) : s;
      }
      const a = [...t, String(i)];
      return zr(e, a, n);
    },
    apply(o, i, a) {
      return Reflect.apply(o, void 0, a);
    }
  });
}
function Vo() {
  const e = globalThis.crypto;
  if (!e?.subtle)
    throw new Error("WebCrypto subtle crypto is required for identity root operations.");
  return e;
}
function Vn(e) {
  const t = globalThis.crypto;
  if (!t?.getRandomValues)
    throw new Error("Secure random values are required for identity root operations.");
  const n = new Uint8Array(e);
  return t.getRandomValues(n), n;
}
function Xs(e) {
  const t = String(e ?? "");
  if (typeof TextEncoder < "u") return new TextEncoder().encode(t);
  if (typeof Buffer < "u") return new Uint8Array(Buffer.from(t, "utf8"));
  const n = unescape(encodeURIComponent(t)), r = new Uint8Array(n.length);
  for (let o = 0; o < n.length; o++) r[o] = n.charCodeAt(o);
  return r;
}
function Ff(e) {
  let t = "";
  for (let n = 0; n < e.length; n++) t += e[n].toString(16).padStart(2, "0");
  return t;
}
function hr(e) {
  if (typeof Buffer < "u")
    return Buffer.from(e).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  let t = "";
  for (let n = 0; n < e.length; n++) t += String.fromCharCode(e[n]);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function pr(e) {
  const t = String(e || "").replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(String(e || "").length / 4) * 4, "=");
  if (typeof Buffer < "u") return new Uint8Array(Buffer.from(t, "base64"));
  const n = atob(t), r = new Uint8Array(n.length);
  for (let o = 0; o < n.length; o++) r[o] = n.charCodeAt(o);
  return r;
}
function Me(e) {
  const t = Uint8Array.from(e);
  return t.buffer.slice(t.byteOffset, t.byteOffset + t.byteLength);
}
function lt(...e) {
  for (const t of e)
    t && t.fill(0);
}
const Fo = 1, Fn = 32, Uf = 16, Tf = 16, Lf = 12, Ys = 6e5, Wr = 21e4, wi = 5e6, $f = "this.me/identity-root/v1", ki = 8, Ei = 1024;
class yr extends Error {
  constructor(t = "Unable to unlock identity root: wrong password or corrupted envelope.") {
    super(t), this.name = "IdentityRootAuthError";
  }
}
class G extends Error {
  constructor(t) {
    super(t), this.name = "IdentityRootFormatError";
  }
}
function Zs(e) {
  if (typeof e != "string")
    throw new G("Password must be a string.");
  if (e.length < ki)
    throw new G(`Password must be at least ${ki} characters.`);
  if (e.length > Ei)
    throw new G(`Password must be at most ${Ei} characters.`);
}
function zf(e) {
  if (!Number.isInteger(e) || e < Wr || e > wi)
    throw new G(
      `PBKDF2 iterations must be an integer between ${Wr} and ${wi}.`
    );
}
function Uo() {
  return {
    rootId: Ff(Vn(Uf)),
    root: Vn(Fn)
  };
}
async function Qs(e, t, n) {
  const { subtle: r } = Vo(), o = Xs(e);
  try {
    const i = await r.importKey("raw", Me(o), "PBKDF2", !1, ["deriveKey"]);
    return await r.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt: Me(t), iterations: n },
      i,
      { name: "AES-GCM", length: 256 },
      !1,
      ["encrypt", "decrypt"]
    );
  } finally {
    lt(o);
  }
}
function ec(e) {
  return Xs(`${$f}::${Fo}::${e}`);
}
async function tr(e, t, n, r = Ys) {
  if (!(e instanceof Uint8Array) || e.length !== Fn)
    throw new G(`Identity root must be exactly ${Fn} bytes.`);
  if (typeof t != "string" || t.length === 0)
    throw new G("rootId is required.");
  Zs(n), zf(r);
  const { subtle: o } = Vo(), i = Vn(Tf), a = Vn(Lf), s = await Qs(n, i, r), c = new Uint8Array(
    await o.encrypt(
      { name: "AES-GCM", iv: Me(a), additionalData: Me(ec(t)) },
      s,
      Me(e)
    )
  ), u = Date.now(), f = {
    v: Fo,
    rootId: t,
    kdf: { name: "PBKDF2", hash: "SHA-256", iterations: r, salt: hr(i) },
    aead: { name: "AES-256-GCM", iv: hr(a), ciphertext: hr(c) },
    createdAt: u,
    updatedAt: u
  };
  return lt(i, a, c), f;
}
function To(e) {
  if (!e || typeof e != "object")
    throw new G("Identity root envelope must be an object.");
  const t = e;
  if (t.v !== Fo)
    throw new G(`Unsupported identity root envelope version: ${String(t.v)}.`);
  if (typeof t.rootId != "string" || t.rootId.length === 0)
    throw new G("Identity root envelope is missing rootId.");
  if (!t.kdf || t.kdf.name !== "PBKDF2" || t.kdf.hash !== "SHA-256")
    throw new G("Unsupported or missing identity root KDF.");
  if (!Number.isInteger(t.kdf.iterations) || t.kdf.iterations < Wr)
    throw new G("Identity root KDF iteration count is below the safety floor.");
  if (typeof t.kdf.salt != "string" || !t.kdf.salt)
    throw new G("Identity root envelope is missing a KDF salt.");
  if (!t.aead || t.aead.name !== "AES-256-GCM")
    throw new G("Unsupported or missing identity root AEAD.");
  if (typeof t.aead.iv != "string" || !t.aead.iv)
    throw new G("Identity root envelope is missing an AEAD nonce.");
  if (typeof t.aead.ciphertext != "string" || !t.aead.ciphertext)
    throw new G("Identity root envelope is missing ciphertext.");
}
async function nr(e, t) {
  To(e), Zs(t);
  const { subtle: n } = Vo(), r = pr(e.kdf.salt), o = pr(e.aead.iv), i = pr(e.aead.ciphertext);
  try {
    const a = await Qs(t, r, e.kdf.iterations), s = new Uint8Array(
      await n.decrypt(
        { name: "AES-GCM", iv: Me(o), additionalData: Me(ec(e.rootId)) },
        a,
        Me(i)
      )
    );
    if (s.length !== Fn)
      throw lt(s), new yr();
    return s;
  } catch (a) {
    throw a instanceof yr ? a : new yr();
  } finally {
    lt(r, o, i);
  }
}
async function tc(e, t, n, r) {
  const o = await nr(e, t);
  try {
    const i = await tr(o, e.rootId, n, r ?? e.kdf.iterations);
    return i.createdAt = e.createdAt, i.updatedAt = Date.now(), i;
  } finally {
    lt(o);
  }
}
function nc(e) {
  return To(e), JSON.parse(JSON.stringify(e));
}
function Ie(e) {
  e && e.fill(0);
}
function Wf(e) {
  return e.identityRootEnvelope !== null;
}
function Hf(e) {
  return e.identityRootUnwrapped !== null;
}
function qf(e) {
  return e.identityRootId;
}
async function Gf(e, t, n = Ys) {
  if (e.identityRootEnvelope)
    throw new Error("An identity root already exists for this kernel. Use rotateIdentityRoot() to replace it.");
  const { rootId: r, root: o } = Uo();
  try {
    e.identityRootEnvelope = await tr(o, r, t, n), e.identityRootId = r, e.identityRootUnwrapped = Uint8Array.from(o);
  } finally {
    Ie(o);
  }
  return ae(e), { rootId: r };
}
async function Jf(e, t) {
  if (!e.identityRootEnvelope)
    throw new Error("No identity root exists for this kernel yet. Call createIdentityRoot() first.");
  const n = await nr(e.identityRootEnvelope, t);
  return Ie(e.identityRootUnwrapped), e.identityRootUnwrapped = n, e.identityRootId = e.identityRootEnvelope.rootId, ae(e), { rootId: e.identityRootId };
}
function Xf(e) {
  Ie(e.identityRootUnwrapped), e.identityRootUnwrapped = null, e.localSecrets = {}, e.localNoises = {}, e._ownerScope = null, ae(e);
}
async function Yf(e, t, n) {
  if (!e.identityRootEnvelope)
    throw new Error("No identity root exists for this kernel yet.");
  const r = await tc(e.identityRootEnvelope, t, n);
  if (e.identityRootEnvelope = r, e.identityRootUnwrapped) {
    const o = await nr(r, n);
    Ie(e.identityRootUnwrapped), e.identityRootUnwrapped = o;
  }
}
async function Zf(e, t, n) {
  if (!n?.acknowledgeExistingV4CiphertextBecomesUnreadable)
    throw new Error(
      "rotateIdentityRoot() replaces the root; any v4 ciphertext encrypted under the previous root will no longer be derivable from it. Pass { acknowledgeExistingV4CiphertextBecomesUnreadable: true } to proceed."
    );
  if (e.identityRootEnvelope && !e.identityRootUnwrapped)
    throw new Error(
      "An identity root exists for this kernel but is locked. Call unlockIdentity(password) first — rotateIdentityRoot() must not be callable without proving ownership of the current root."
    );
  const r = e.identityRootId, { rootId: o, root: i } = Uo();
  try {
    e.identityRootEnvelope = await tr(i, o, t, n.iterations), e.identityRootId = o, Ie(e.identityRootUnwrapped), e.identityRootUnwrapped = Uint8Array.from(i);
  } finally {
    Ie(i);
  }
  return e.migrationV4 = {}, e.migrationV4Values = {}, ae(e), { rootId: o, previousRootId: r };
}
function Qf(e) {
  if (!e.identityRootEnvelope)
    throw new Error("No identity root exists for this kernel yet.");
  return nc(e.identityRootEnvelope);
}
function ed(e, t, n = {}) {
  if (To(t), e.identityRootEnvelope && e.identityRootEnvelope.rootId !== t.rootId && !n.force)
    throw new G(
      "A different identity root already exists for this kernel. Pass { force: true } to replace it explicitly."
    );
  return e.identityRootEnvelope = nc(t), e.identityRootId = t.rootId, Ie(e.identityRootUnwrapped), e.identityRootUnwrapped = null, ae(e), { rootId: t.rootId };
}
function Mi(e) {
  Ie(e.identityRootUnwrapped), e.identityRootUnwrapped = null, e.identityRootEnvelope = null, e.identityRootId = null, e.migrationV4 = {}, e.migrationV4Values = {};
}
function td(e) {
  const t = {
    migratedScopes: 0,
    migratedChunks: 0,
    pendingScopes: [],
    skippedAlreadyV4: 0,
    skippedOtherFormat: 0,
    errors: 0
  };
  if (!e.identityRootUnwrapped) {
    for (const n of e.branchStore.listScopes())
      e.migrationV4[n] = "pending", t.pendingScopes.push(n);
    return t;
  }
  for (const n of e.branchStore.listScopes()) {
    const r = n.split(".").filter(Boolean), o = oe(e, r);
    if (!o) {
      e.migrationV4[n] = "pending", t.pendingScopes.push(n);
      continue;
    }
    let i = 0, a = !1;
    try {
      const s = go(e, r, o), c = Wa(e, r, "branch");
      for (const [u, f] of Object.entries(s)) {
        const d = ht(f);
        if (d === "v4") {
          t.skippedAlreadyV4++;
          continue;
        }
        if (d !== "v3") {
          t.skippedOtherFormat++;
          continue;
        }
        const h = he(e, r, o, u);
        if (!h || typeof h != "object") {
          t.errors++, a = !0;
          continue;
        }
        const p = pu(h, c, "branch", r, e.identityRootUnwrapped), y = yu(p, c, "branch", r, e.identityRootUnwrapped);
        if (JSON.stringify(y) !== JSON.stringify(h)) {
          t.errors++, a = !0;
          continue;
        }
        bo(e, r, u, p, o), i++, t.migratedChunks++;
      }
    } catch {
      t.errors++, a = !0;
    } finally {
      He(e, n);
    }
    i > 0 && t.migratedScopes++, !a && i === 0 || (a ? (e.migrationV4[n] = "pending", t.pendingScopes.push(n)) : e.migrationV4[n] = "migrated");
  }
  return t;
}
function nd(e) {
  const t = { migrated: 0, pending: [], skippedAlreadyV4: 0, errors: 0 }, n = Object.entries(e.index).filter(([, r]) => so(r));
  for (const [r, o] of n) {
    const i = ht(o);
    if (i === "v4") {
      t.skippedAlreadyV4++;
      continue;
    }
    if (i !== "v3") continue;
    if (!e.identityRootUnwrapped) {
      e.migrationV4Values[r] = "pending", t.pending.push(r);
      continue;
    }
    const a = r.split(".").filter(Boolean);
    let s;
    try {
      const c = Gn(e, a, "value");
      s = io(o, c);
    } catch {
      s = null;
    }
    if (s == null) {
      e.migrationV4Values[r] = "pending", t.pending.push(r);
      continue;
    }
    try {
      Ee(e, a, s, null), e.migrationV4Values[r] = "migrated", t.migrated++;
    } catch {
      t.errors++, e.migrationV4Values[r] = "pending", t.pending.push(r);
    }
  }
  return t;
}
function rr(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) t += e[n] * e[n];
  return Math.sqrt(t);
}
function rc(e, t) {
  const n = Math.min(e.length, t.length);
  let r = 0, o = 0, i = 0;
  for (let a = 0; a < n; a++) {
    const s = e[a], c = t[a];
    r += s * c, o += s * s, i += c * c;
  }
  return o <= 0 || i <= 0 ? 0 : r / (Math.sqrt(o) * Math.sqrt(i));
}
function oc(e, t, n, r, o = rr(e)) {
  let i = 0, a = 0;
  for (let s = 0; s < r; s++) {
    const c = e[s], u = t[n + s];
    i += c * u, a += u * u;
  }
  return o <= 0 || a <= 0 ? 0 : i / (o * Math.sqrt(a));
}
function Lo(e) {
  const t = rr(e);
  if (t <= 0) return Float32Array.from(e);
  const n = new Float32Array(e.length);
  for (let r = 0; r < e.length; r++) n[r] = e[r] / t;
  return n;
}
function Un(e, t, n) {
  if (n <= 0) return;
  let r = e.length;
  for (; r > 0 && rd(t, e[r - 1]) < 0; )
    r--;
  r >= n || (e.splice(r, 0, t), e.length > n && (e.length = n));
}
function rd(e, t) {
  return e.score !== t.score ? t.score - e.score : e.index !== t.index ? e.index - t.index : e.path.localeCompare(t.path);
}
function ic(e) {
  const n = (typeof process < "u" ? process : null)?.getBuiltinModule;
  if (typeof n == "function")
    return n(e);
}
function ac() {
  return ic("node:fs");
}
function od() {
  return ic("node:path");
}
function id(e) {
  return `${e.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "root"}.${pe(e)}`;
}
function ad(e) {
  if (typeof Buffer < "u")
    return Buffer.from(e.buffer, e.byteOffset, e.byteLength).toString("base64");
  let t = "";
  const n = new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  for (let o = 0; o < n.length; o++) t += String.fromCharCode(n[o]);
  const r = globalThis.btoa;
  if (typeof r != "function")
    throw new Error("Base64 encoding is not available in this runtime.");
  return r(t);
}
function sd(e) {
  let t;
  if (typeof Buffer < "u") {
    const r = Buffer.from(e, "base64");
    t = new Uint8Array(r.buffer, r.byteOffset, r.byteLength);
  } else {
    const r = globalThis.atob;
    if (typeof r != "function")
      throw new Error("Base64 decoding is not available in this runtime.");
    const o = r(e);
    t = new Uint8Array(o.length);
    for (let i = 0; i < o.length; i++) t[i] = o.charCodeAt(i);
  }
  const n = t.byteOffset === 0 && t.byteLength === t.buffer.byteLength ? t.buffer : t.buffer.slice(t.byteOffset, t.byteOffset + t.byteLength);
  return new Float32Array(n);
}
function $o(e) {
  return e.join(".");
}
function sc(e, t) {
  const n = e.branchStore.getAuxiliaryPath(`vector-indexes/${id($o(t))}.json`);
  return typeof n == "string" && n.length > 0 ? n : null;
}
function cc(e, t, n) {
  e.vectorIndexes.set($o(t), n);
}
function cd(e, t) {
  return e.vectorIndexes.get($o(t)) ?? null;
}
function ud(e, t, n) {
  const r = sc(e, t);
  if (!r) return { persisted: !1, path: null };
  const o = ac(), i = od();
  if (!o || !i) return { persisted: !1, path: null };
  const a = {
    meta: n.meta,
    centroids: ad(n.centroids),
    postingLists: n.postingLists
  };
  return o.mkdirSync(i.dirname(r), { recursive: !0 }), o.writeFileSync(r, JSON.stringify(a), "utf8"), { persisted: !0, path: r };
}
function ld(e, t) {
  const n = cd(e, t);
  if (n) return n;
  const r = sc(e, t);
  if (!r) return null;
  const o = ac();
  if (!o || !o.existsSync(r)) return null;
  try {
    const i = JSON.parse(o.readFileSync(r, "utf8"));
    if (!i || typeof i != "object" || !i.meta || typeof i.centroids != "string" || !Array.isArray(i.postingLists))
      return null;
    const a = {
      meta: i.meta,
      centroids: sd(i.centroids),
      postingLists: i.postingLists.map(
        (s) => Array.isArray(s) ? s.filter((c) => c && typeof c == "object").map((c) => ({
          chunkId: String(c.chunkId ?? ""),
          count: Math.max(0, Math.floor(Number(c.count ?? 0) || 0))
        })).filter((c) => c.chunkId.length > 0 && c.count > 0) : []
      )
    };
    return cc(e, t, a), a;
  } catch {
    return null;
  }
}
function Se() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
function fd(e, t) {
  const n = Array.isArray(t) ? t : String(t || "").split(".").filter(Boolean);
  return e.normalizeSelectorPath(n);
}
function dd(e) {
  if (e instanceof Float32Array) return e;
  const t = new Float32Array(e.length);
  for (let n = 0; n < e.length; n++) t[n] = Number(e[n]) || 0;
  return t;
}
function hd(e) {
  return !Number.isFinite(e) || e <= 0 || e === Number.MAX_SAFE_INTEGER ? null : Math.floor(e);
}
function uc(e, t) {
  const n = hd(t);
  if (e instanceof Float32Array)
    return n === null || e.length === n ? e : null;
  if (Array.isArray(e))
    return n !== null && e.length !== n ? null : Float32Array.from(e.map((r) => Number(r) || 0));
  if (e && typeof e == "object") {
    if (n === null) return null;
    const r = new Float32Array(n);
    let o = !1;
    const i = e;
    for (let a = 0; a < n; a++) {
      const s = i[String(a)];
      s !== void 0 && (o = !0), r[a] = Number(s) || 0;
    }
    return o ? r : null;
  }
  return null;
}
function lc(e) {
  return [...e].sort((t, n) => Ai(t) - Ai(n) || t.localeCompare(n));
}
function Ai(e) {
  const t = /^idx_(\d+)$/.exec(e);
  if (t) return Number(t[1]);
  const n = /^(\d+)_root$/.exec(e);
  return n ? Number(n[1]) : Number.MAX_SAFE_INTEGER;
}
function Ci(e, t, n, r, o) {
  const i = /^idx_(\d+)$/.exec(t);
  if (i) {
    const s = Number(i[1]) * o + n;
    return {
      path: [...e, String(s)].join("."),
      index: s
    };
  }
  const a = /^(\d+)_root$/.exec(t);
  if (a) {
    const s = Number(a[1]);
    return {
      path: [...e, String(s)].join("."),
      index: s
    };
  }
  return {
    path: [...e, String(r)].join("."),
    index: r
  };
}
function fc(e, t) {
  const n = fd(e, t), r = e.resolveBranchScope(n);
  if (!r || r.length === 0 || r.join(".") !== n.join("."))
    throw new Error(
      `Vector search requires a collection-scoped secret branch. Expected a secret declared exactly at "${n.join(".")}".`
    );
  const o = e.computeEffectiveSecret(n);
  if (!o)
    throw new Error(`Vector search could not resolve an effective secret for "${n.join(".")}".`);
  return { scope: n, scopeSecret: o };
}
function Bi(e, t) {
  return t ? Lo(e) : Float32Array.from(e);
}
function zo(e, t, n, r, o) {
  const i = n * r;
  if (o) {
    let u = 0;
    for (let f = 0; f < r; f++) u += e[f] * t[i + f];
    return u;
  }
  let a = 0, s = 0, c = 0;
  for (let u = 0; u < r; u++) {
    const f = e[u], d = t[i + u];
    a += f * d, s += f * f, c += d * d;
  }
  return s <= 0 || c <= 0 ? 0 : a / (Math.sqrt(s) * Math.sqrt(c));
}
function dc(e, t, n, r, o) {
  let i = 0, a = -1 / 0;
  for (let s = 0; s < n; s++) {
    const c = zo(e, t, s, r, o);
    c > a && (a = c, i = s);
  }
  return i;
}
function _i(e, t, n, r) {
  const o = t * r;
  for (let i = 0; i < r; i++) e[o + i] = n[i];
}
function pd(e, t, n, r, o, i) {
  const a = t * o;
  if (r <= 0) return;
  const s = new Float32Array(o);
  for (let u = 0; u < o; u++) s[u] = n[u] / r;
  const c = i ? Lo(s) : s;
  for (let u = 0; u < o; u++) e[a + u] = c[u];
}
function yd(e, t, n, r) {
  const o = new Float32Array(t * n);
  _i(o, 0, e[0], n);
  for (let i = 1; i < t; i++) {
    let a = 0, s = -1 / 0;
    for (let c = 0; c < e.length; c++) {
      const u = e[c];
      let f = -1 / 0;
      for (let h = 0; h < i; h++)
        f = Math.max(f, zo(u, o, h, n, r));
      const d = 1 - f;
      d > s && (s = d, a = c);
    }
    _i(o, i, e[a], n);
  }
  return o;
}
function md(e, t, n, r, o) {
  const i = yd(e, t, n, o);
  for (let a = 0; a < r; a++) {
    const s = Array.from({ length: t }, () => new Float32Array(n)), c = new Uint32Array(t);
    for (const u of e) {
      const f = dc(u, i, t, n, o);
      c[f] += 1;
      const d = s[f];
      for (let h = 0; h < n; h++) d[h] += u[h];
    }
    for (let u = 0; u < t; u++)
      c[u] <= 0 || pd(i, u, s[u], c[u], n, o);
  }
  return i;
}
function Ri(e, t) {
  if (e <= 0 || t <= 0) return [];
  if (t >= e) return Array.from({ length: e }, (r, o) => o);
  const n = /* @__PURE__ */ new Set();
  for (let r = 0; r < t; r++) {
    const o = Math.min(e - 1, Math.floor((r + 0.5) * e / t));
    n.add(o);
  }
  if (n.size >= t) return [...n].sort((r, o) => r - o);
  for (let r = 0; r < e && n.size < t; r++)
    n.add(r);
  return [...n].sort((r, o) => r - o);
}
function Ii(e, t) {
  return e <= 0 || t <= 0 ? 1 : Math.max(1, Math.round(e / t));
}
function gd(e, t, n, r, o, i) {
  const a = [];
  let s = 0, c = 0;
  for (const u of r) {
    const f = e.getDecryptedChunk(t, n, u);
    if (!f) continue;
    if (yt(f)) {
      const S = f.payload, g = S.embeddings, b = S.meta.dims, A = S.meta.count;
      if (!(g instanceof Float32Array) || b <= 0 || A <= 0 || (s === 0 && (s = b), b !== s)) continue;
      c += A;
      const m = Ri(A, i), x = Ii(A, m.length), E = m.map((C) => {
        const D = C * b, R = D + b;
        return {
          vector: Bi(g.subarray(D, R), o),
          weight: x
        };
      });
      E.length > 0 && a.push({
        chunkId: u,
        vectorCount: A,
        representatives: E
      });
      continue;
    }
    if (!Array.isArray(f)) continue;
    const d = [];
    for (let S = 0; S < f.length; S++) {
      const g = f[S];
      if (!g || typeof g != "object") continue;
      const b = uc(g.embedding, s || Number.MAX_SAFE_INTEGER);
      b && (s === 0 && (s = b.length), b.length === s && d.push(Bi(b, o)));
    }
    if (d.length <= 0) continue;
    c += d.length;
    const h = Ri(d.length, i), p = Ii(d.length, h.length), y = h.map((S) => ({
      vector: d[S],
      weight: p
    }));
    a.push({
      chunkId: u,
      vectorCount: d.length,
      representatives: y
    });
  }
  return { chunks: a, dims: s, totalVectors: c };
}
function bd(e, t, n, r, o, i) {
  const a = [];
  for (let s = 0; s < n; s++) {
    const c = zo(e, t, s, r, o);
    a.push({ centroidId: s, score: c });
  }
  return a.sort((s, c) => c.score - s.score || s.centroidId - c.centroidId), a.slice(0, i);
}
function xd(e, t, n, r, o, i) {
  const a = [], s = rr(r);
  let c = 0, u = 0, f = 0;
  for (const d of o) {
    const h = e.getDecryptedChunk(t, n, d);
    if (h) {
      if (u++, yt(h)) {
        const p = h.payload, y = p.embeddings;
        if (!(y instanceof Float32Array) || p.meta.dims <= 0 || p.meta.count <= 0) continue;
        if (r.length !== p.meta.dims)
          throw new Error(
            `searchVector dims mismatch for "${t.join(".")}": query=${r.length}, payload=${p.meta.dims}`
          );
        c = p.meta.dims;
        for (let S = 0; S < p.meta.count; S++) {
          const g = S * p.meta.dims, b = oc(r, y, g, p.meta.dims, s);
          if (f++, b < i.minScore) continue;
          const A = p.ids?.[S] ?? S, { path: m, index: x } = Ci(t, d, S, A, e.secretChunkSize);
          Un(a, {
            path: m,
            score: b,
            index: x,
            id: A,
            chunkId: d,
            chunkOffset: S
          }, i.k);
        }
        continue;
      }
      if (Array.isArray(h))
        for (let p = 0; p < h.length; p++) {
          const y = h[p];
          if (!y || typeof y != "object") continue;
          const S = uc(y.embedding, r.length);
          if (!S) continue;
          const g = rc(r, S);
          if (f++, g < i.minScore) continue;
          const b = y.id, A = typeof b == "number" && Number.isFinite(b) ? Math.floor(b) : p, { path: m, index: x } = Ci(t, d, p, A, e.secretChunkSize);
          Un(a, {
            path: m,
            score: g,
            index: x,
            id: A,
            chunkId: d,
            chunkOffset: p
          }, i.k);
        }
    }
  }
  return {
    dims: c,
    scannedVectors: f,
    decryptedChunks: u,
    hits: a
  };
}
function vd(e, t, n = {}) {
  const r = Se(), { scope: o, scopeSecret: i } = fc(e, t), a = lc(e.branchStore.listChunks(o.join("."))), s = Math.max(1, Math.floor(n.chunkRepresentativesPerChunk ?? 4)), c = Math.max(256, Math.floor(n.maxTrainingVectors ?? 4096)), u = n.normalize !== !1, f = gd(
    e,
    o,
    i,
    a,
    u,
    s
  ), d = f.dims, h = f.totalVectors, p = f.chunks.flatMap((R) => R.representatives.map((V) => V.vector)), y = Math.max(1, Math.floor(p.length / c)), S = [];
  for (let R = 0; R < p.length && S.length < c; R += y)
    S.push(p[R]);
  if (d <= 0 || h <= 0 || S.length === 0)
    throw new Error(`buildVectorIndex could not find any vectors under "${o.join(".")}".`);
  const g = Math.max(1, Math.min(h, Math.min(S.length, Math.floor(n.k ?? Math.round(Math.sqrt(h)))))), b = Math.max(1, Math.min(g, Math.floor(n.nprobe ?? 3))), A = Math.max(1, Math.floor(n.iterations ?? 6)), m = md(S, g, d, A, u), x = Array.from({ length: g }, () => /* @__PURE__ */ new Map());
  for (const R of f.chunks)
    for (const V of R.representatives) {
      if (V.vector.length !== d) continue;
      const q = dc(V.vector, m, g, d, u);
      x[q].set(
        R.chunkId,
        (x[q].get(R.chunkId) ?? 0) + V.weight
      );
    }
  const E = x.map(
    (R) => [...R.entries()].map(([V, q]) => ({ chunkId: V, count: q })).sort((V, q) => q.count - V.count || V.chunkId.localeCompare(q.chunkId))
  ), C = {
    meta: {
      version: 1,
      scopePath: o.join("."),
      dims: d,
      k: g,
      nprobe: b,
      totalVectors: h,
      totalChunks: a.length,
      trainingVectors: S.length,
      normalize: u,
      builtAt: Date.now()
    },
    centroids: m,
    postingLists: E
  };
  cc(e, o, C);
  const D = ud(e, o, C);
  return {
    scopePath: o.join("."),
    tookMs: Se() - r,
    dims: d,
    k: g,
    nprobe: b,
    totalVectors: h,
    totalChunks: a.length,
    trainingVectors: S.length,
    persisted: D.persisted,
    indexPath: D.path
  };
}
function Sd(e, t, n, r = {}) {
  const o = Se(), { scope: i, scopeSecret: a } = fc(e, t), s = ld(e, i);
  if (!s)
    throw new Error(`searchVector could not find an IVF sidecar for "${i.join(".")}". Build it first with buildVectorIndex().`);
  const c = Math.max(1, Math.floor(r.k ?? 10)), u = Math.max(1, Math.min(s.meta.k, Math.floor(r.nprobe ?? s.meta.nprobe))), f = Number.isFinite(r.minScore) ? Number(r.minScore) : -1 / 0, d = Math.max(1, Math.floor(r.maxCandidateChunks ?? Math.max(c, u * 4))), h = dd(n);
  if (h.length !== s.meta.dims)
    throw new Error(
      `searchVector dims mismatch for "${i.join(".")}": query=${h.length}, index=${s.meta.dims}`
    );
  const p = s.meta.normalize ? Lo(h) : h, y = Se(), S = bd(p, s.centroids, s.meta.k, s.meta.dims, s.meta.normalize, u), g = /* @__PURE__ */ new Map();
  for (const { centroidId: C, score: D } of S) {
    const R = s.postingLists[C] ?? [];
    for (const V of R)
      g.set(V.chunkId, (g.get(V.chunkId) ?? 0) + D * V.count);
  }
  const b = [...g.entries()].sort((C, D) => D[1] - C[1] || C[0].localeCompare(D[0])).slice(0, d).map(([C]) => C), A = Se() - y, m = Se(), x = xd(e, i, a, h, lc(b), { k: c, minScore: f }), E = Se() - m;
  return {
    scopePath: i.join("."),
    tookMs: Se() - o,
    coarseMs: A,
    exactMs: E,
    dims: x.dims,
    k: c,
    nprobe: u,
    candidateChunks: b.length,
    decryptedChunks: x.decryptedChunks,
    scannedVectors: x.scannedVectors,
    hits: x.hits
  };
}
function Pi() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
function wd(e, t) {
  const n = Array.isArray(t) ? t : String(t || "").split(".").filter(Boolean);
  return e.normalizeSelectorPath(n);
}
function kd(e) {
  if (e instanceof Float32Array) return e;
  const t = new Float32Array(e.length);
  for (let n = 0; n < e.length; n++) t[n] = Number(e[n]) || 0;
  return t;
}
function Ed(e, t) {
  if (e instanceof Float32Array)
    return e.length === t ? e : null;
  if (Array.isArray(e))
    return e.length !== t ? null : Float32Array.from(e.map((n) => Number(n) || 0));
  if (e && typeof e == "object") {
    const n = new Float32Array(t);
    let r = !1;
    const o = e;
    for (let i = 0; i < t; i++) {
      const a = o[String(i)];
      a !== void 0 && (r = !0), n[i] = Number(a) || 0;
    }
    return r ? n : null;
  }
  return null;
}
function Md(e) {
  return [...e].sort((t, n) => Di(t) - Di(n) || t.localeCompare(n));
}
function Di(e) {
  const t = /^idx_(\d+)$/.exec(e);
  if (t) return Number(t[1]);
  const n = /^(\d+)_root$/.exec(e);
  return n ? Number(n[1]) : Number.MAX_SAFE_INTEGER;
}
function Oi(e, t, n, r, o) {
  const i = /^idx_(\d+)$/.exec(t);
  if (i) {
    const s = Number(i[1]) * o + n;
    return {
      path: [...e, String(s)].join("."),
      index: s
    };
  }
  const a = /^(\d+)_root$/.exec(t);
  if (a) {
    const s = Number(a[1]);
    return {
      path: [...e, String(s)].join("."),
      index: s
    };
  }
  return {
    path: [...e, String(r)].join("."),
    index: r
  };
}
function Ad(e, t, n, r = {}) {
  const o = Pi(), i = wd(e, t), a = e.resolveBranchScope(i);
  if (!a || a.length === 0 || a.join(".") !== i.join("."))
    throw new Error(
      `searchExact requires a collection-scoped secret branch. Expected a secret declared exactly at "${i.join(".")}".`
    );
  const s = e.computeEffectiveSecret(i);
  if (!s)
    throw new Error(`searchExact could not resolve an effective secret for "${i.join(".")}".`);
  const c = Math.max(1, Math.floor(r.k ?? 10)), u = Number.isFinite(r.minScore) ? Number(r.minScore) : -1 / 0, f = kd(n), d = rr(f), h = Md(e.branchStore.listChunks(i.join("."))), p = [];
  let y = 0, S = 0, g = 0;
  for (const b of h) {
    const A = e.getDecryptedChunk(i, s, b);
    if (A) {
      if (S++, yt(A)) {
        const m = A.payload, x = m.embeddings;
        if (!(x instanceof Float32Array) || m.meta.dims <= 0 || m.meta.count <= 0) continue;
        if (f.length !== m.meta.dims)
          throw new Error(
            `searchExact dims mismatch for "${i.join(".")}": query=${f.length}, payload=${m.meta.dims}`
          );
        y = m.meta.dims;
        for (let E = 0; E < m.meta.count; E++) {
          const C = E * m.meta.dims, D = oc(f, x, C, m.meta.dims, d);
          if (g++, D < u) continue;
          const R = m.ids?.[E] ?? E, { path: V, index: q } = Oi(i, b, E, R, e.secretChunkSize);
          Un(p, {
            path: V,
            score: D,
            index: q,
            id: R,
            chunkId: b,
            chunkOffset: E
          }, c);
        }
        continue;
      }
      if (Array.isArray(A))
        for (let m = 0; m < A.length; m++) {
          const x = A[m];
          if (!x || typeof x != "object") continue;
          const E = x.embedding, C = Ed(E, f.length);
          if (!C) continue;
          y === 0 && (y = C.length);
          const D = rc(f, C);
          if (g++, D < u) continue;
          const R = x.id, V = typeof R == "number" && Number.isFinite(R) ? Math.floor(R) : m, { path: q, index: Ke } = Oi(i, b, m, V, e.secretChunkSize);
          Un(p, {
            path: q,
            score: D,
            index: Ke,
            id: V,
            chunkId: b,
            chunkOffset: m
          }, c);
        }
    }
  }
  return {
    scopePath: i.join("."),
    tookMs: Pi() - o,
    scannedChunks: S,
    scannedVectors: g,
    dims: y,
    hits: p
  };
}
const hc = "this.me.seed:v1", Cd = "this.me/identity:v1::", Bd = "me.seed/compound:v1::", { keccak256: pc } = Vi;
let vn = null;
function _d(e) {
  let t = "";
  for (const n of e) t += n.toString(16).padStart(2, "0");
  return t;
}
function Rd() {
  const e = globalThis.crypto;
  if (!e?.getRandomValues)
    throw new Error("Secure random values are required to initialize .me.");
  const t = new Uint8Array(32);
  return e.getRandomValues(t), _d(t);
}
function Id(e) {
  if (e != null)
    return typeof e == "string" ? e : String(e);
}
function mr(e) {
  return pc(Cd + e);
}
function gr(e, t) {
  return pc(Bd + e + "::" + t);
}
function Ni(e) {
  return String(e || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/g, "").replace(/^\.+/, "").replace(/\.+$/g, "");
}
function Pd() {
  if (vn !== null) return vn;
  try {
    const e = globalThis.localStorage?.getItem(hc);
    if (e !== null)
      return vn = e, e;
  } catch {
  }
}
function Dd(e) {
  vn = e;
  try {
    globalThis.localStorage?.setItem(hc, e);
  } catch {
  }
}
function ji(e) {
  const t = Id(e);
  if (t !== void 0) return t;
  const n = Pd() ?? Rd();
  return Dd(n), n;
}
let Ki = !1;
function Od() {
  Ki || (Ki = !0, console.warn(
    "[this.me] ME#withScope is deprecated and does not restrict reads on existing handles. Migrate to me.as(key|null) and read through the returned handle. See CHANGELOG / TypeDoc."
  ));
}
var ee, ce, Y;
const Pe = class Pe {
  constructor(t, n = {}, r = {}) {
    bn(this, ee);
    bn(this, ce);
    bn(this, Y);
    te(this, Y, null), this._ownerScope = null, this._currentCallerScope = void 0;
    const o = typeof n == "string";
    if (o && typeof t != "string")
      throw new Error("COMPOUND_SEED_WHO_REQUIRED");
    const i = o ? t : null, a = o ? n : null, s = o ? r : n;
    Object.assign(this, Nf(s)), te(this, ee, ji(o ? gr(i, a) : t)), te(this, ce, mr(H(this, ee))), te(this, Y, i), this.bumpSecretEpoch(), this.rebuildIndex(), Object.defineProperty(this, di, {
      configurable: !0,
      enumerable: !1,
      get: () => H(this, ee)
    }), Object.defineProperty(this, Dr, {
      configurable: !0,
      enumerable: !1,
      get: () => H(this, Y)
    }), Object.defineProperty(this, On, {
      configurable: !0,
      enumerable: !1,
      get: () => ({
        hash: H(this, ce),
        expression: H(this, Y)
      })
    }), Object.defineProperty(this, Ao, {
      configurable: !0,
      enumerable: !1,
      value: (u) => {
        te(this, Y, u);
      }
    }), Object.defineProperty(this, Or, {
      configurable: !0,
      enumerable: !1,
      value: (u, f) => {
        te(this, ee, gr(u, f)), te(this, ce, mr(H(this, ee))), te(this, Y, u), Mi(this), this.localSecrets = {}, this.localNoises = {}, this.protectedScopeKeys.clear(), this._ownerScope = null, this.bumpSecretEpoch(), this.rebuildIndex();
      }
    });
    const c = this.createProxy([]);
    if (Object.setPrototypeOf(c, Pe.prototype), Object.assign(c, this), Object.defineProperty(c, zl, {
      configurable: !0,
      enumerable: !1,
      value: () => ({
        seed: H(this, ee),
        expression: H(this, Y)
      })
    }), Object.defineProperty(c, di, {
      configurable: !0,
      enumerable: !1,
      get: () => H(this, ee)
    }), Object.defineProperty(c, Dr, {
      configurable: !0,
      enumerable: !1,
      get: () => H(this, Y)
    }), Object.defineProperty(c, On, {
      configurable: !0,
      enumerable: !1,
      get: () => ({
        hash: H(this, ce),
        expression: H(this, Y)
      })
    }), Object.defineProperty(c, Or, {
      configurable: !0,
      enumerable: !1,
      value: (u, f) => {
        te(this, ee, gr(u, f)), te(this, ce, mr(H(this, ee))), te(this, Y, u), Mi(this), this.localSecrets = {}, this.localNoises = {}, this.protectedScopeKeys.clear(), this._ownerScope = null, this.bumpSecretEpoch(), this.rebuildIndex();
      }
    }), s.namespace) {
      const u = String(H(this, Y) || "").trim();
      if (!u) throw new Error("ACTIVE_EXPRESSION_REQUIRED");
      const f = Ni(s.namespace);
      if (!f) throw new Error("ROOT_NAMESPACE_REQUIRED");
      c.profile.rootNamespace(f), c.profile.namespace(`${u}.${f}`);
    }
    return c;
  }
  /** @internal Low-level crypto helper kept out of the main public docs surface. */
  static wrapSecretV1(t) {
    return Cu(t);
  }
  /** @internal Low-level crypto helper kept out of the main public docs surface. */
  static unwrapSecretV1(t, n, r = "bytes") {
    return ha(t, n, r);
  }
  /**
   * Public redacted memory log.
   * This never exposes internal forensic fields such as `effectiveSecret`.
   */
  get memories() {
    return Co(this._memories);
  }
  get encryptedBranches() {
    return this.branchStore.view();
  }
  set encryptedBranches(t) {
    this.branchStore.importData(t && typeof t == "object" ? t : {});
  }
  /**
   * Inspect the current runtime state.
   * Returned memories are always public/redacted.
   */
  inspect(t) {
    return Af(this, t);
  }
  /**
   * Explain how a semantic path is derived.
   * Useful for debugging pointers, operators, and derived values.
   */
  explain(t) {
    return Cl(this, t);
  }
  /**
   * Execute a raw target string or parsed target AST without going through proxy property access.
   * Useful for tooling, explicit runtime dispatch, and tests.
   */
  execute(t, n, r) {
    return Cf(this, t, n, r);
  }
  /**
   * Exact vector search over a collection-scoped secret branch backed by chunked columnar storage.
   * This is the correctness baseline used before approximate indexes such as IVF.
   */
  searchExact(t, n, r = {}) {
    return Ad(this, t, n, r);
  }
  /**
   * Build an approximate IVF sidecar for a collection-scoped secret vector corpus.
   * The sidecar lives outside the kernel log and is intended to reduce chunk decrypts during search.
   */
  buildVectorIndex(t, n = {}) {
    return vd(this, t, n);
  }
  /**
   * Approximate vector search backed by the IVF sidecar.
   * Uses centroids for coarse routing and exact scan only on the selected candidate chunks.
   */
  searchVector(t, n, r = {}) {
    return Sd(this, t, n, r);
  }
  cloneValue(t) {
    return X(t);
  }
  handleSelfTarget(t, n, r) {
    return $s(this, t, n, r);
  }
  handleKernelTarget(t, n, r) {
    return _a(this, t, n, r);
  }
  handleKernelRead(t) {
    return Ra(this, t);
  }
  handleKernelExport(t) {
    return Ia(this, t);
  }
  handleKernelImport(t, n) {
    return Pa(this, t, n);
  }
  handleKernelReplay(t, n) {
    return Oa(this, t, n);
  }
  handleKernelRehydrate(t, n) {
    return Na(this, t, n);
  }
  handleKernelGet(t) {
    return ja(this, t);
  }
  handleKernelSet(t, n) {
    return Ka(this, t, n);
  }
  handleKeySpaceTarget(t, n, r) {
    return Vs(this, t, n, r);
  }
  inspectAtPath(t) {
    return zs(this, t);
  }
  parseKeySpacePath(t) {
    return Fs(t);
  }
  readWrappedKey(t) {
    return Oo(this, t);
  }
  writeWrappedKey(t, n) {
    return Us(this, t, n);
  }
  openWrappedKey(t, n) {
    return Ts(this, t, n);
  }
  normalizeExecutableTarget(t) {
    return Va(this, t);
  }
  parseExecutableTarget(t) {
    return Fa(t);
  }
  splitTargetNamespace(t, n) {
    return Ua(t, n);
  }
  normalizeExecutablePath(t) {
    return ho(t);
  }
  findTopLevelIndex(t, n) {
    return pa(t, n);
  }
  /**
   * Export a portable public snapshot.
   * Snapshot memories are redacted and omit internal forensic fields.
   */
  exportSnapshot() {
    return Sf(this);
  }
  /**
   * Hydrate the runtime from a snapshot payload.
   * This is the primary restore API for bringing a saved kernel back to life in memory.
   */
  hydrate(t) {
    return No(this, t);
  }
  /**
   * Import a snapshot into the current runtime.
   * Accepts both redacted public snapshots and legacy/internal payloads.
   * Prefer `hydrate()` in user-facing code.
   */
  importSnapshot(t) {
    return wf(this, t);
  }
  /**
   * Rehydrate the runtime from a snapshot payload.
   * Backward-compatible alias for `hydrate()`.
   */
  rehydrate(t) {
    return kf(this, t);
  }
  /**
   * Replay a memory log into the current runtime.
   * Accepts both public `Memory[]` and legacy/internal memory payloads.
   */
  replayMemories(t) {
    return tf(this, t);
  }
  /**
   * Ingest a single memory-like payload into the runtime.
   * Useful for tools that already operate at the memory-log layer.
   */
  learn(t) {
    return ef(this, t);
  }
  /**
   * Derive a branch-scoped proof for the current active expression.
   * This signs a canonical payload with an Ed25519 key deterministically derived
   * from the root seed and active branch expression.
   */
  async prove(t) {
    const n = String(H(this, Y) || "").trim();
    if (!n) throw new Error("ACTIVE_EXPRESSION_REQUIRED");
    const r = Ni(t.rootNamespace);
    if (!r) throw new Error("ROOT_NAMESPACE_REQUIRED");
    const o = Date.now(), i = t.challenge == null ? null : String(t.challenge), a = `${n}.${r}`, s = await wu(H(this, ee), n), { privateKey: c, publicKey: u } = await ku(s), f = {
      identityHash: H(this, ce),
      expression: n,
      namespace: a,
      rootNamespace: r,
      challenge: i,
      timestamp: o
    }, d = wn(f), h = await Eu(c, d), p = await Au(u);
    return {
      identityHash: H(this, ce),
      expression: n,
      namespace: a,
      rootNamespace: r,
      publicKey: p,
      message: d,
      signature: h,
      timestamp: o
    };
  }
  /**
   * Control whether derivations recompute eagerly or lazily.
   */
  setRecomputeMode(t) {
    return Fu(this, t);
  }
  /**
   * Read the current derivation recompute mode.
   */
  getRecomputeMode() {
    return Uu(this);
  }
  /** @internal Low-level keyring helper kept out of the main public docs surface. */
  installRecipientKey(t, n) {
    return yf(this, t, n);
  }
  /** @internal Low-level keyring helper kept out of the main public docs surface. */
  uninstallRecipientKey(t) {
    return mf(this, t);
  }
  /** @internal Low-level keyring helper kept out of the main public docs surface. */
  storeWrappedKey(t, n, r) {
    return gf(this, t, n, r);
  }
  /**
   * Re-encrypt existing secret branch chunks into blob v3.
   * This remains useful after v3 became the default write path because older snapshots
   * and mixed runtimes may still carry branch blobs in v2 or legacy layouts.
   * It only touches `encryptedBranches`; it never rewrites historical memories.
   *
   * @internal Maintenance helper for secret-blob upgrades.
   */
  migrateEncryptedBranchesToV3() {
    const t = {
      migratedScopes: 0,
      migratedChunks: 0,
      skipped: 0,
      errors: 0
    };
    for (const n of this.branchStore.listScopes()) {
      const r = n.split(".").filter(Boolean), o = this.computeEffectiveSecret(r);
      if (!o) {
        t.skipped++;
        continue;
      }
      let i = 0;
      try {
        const a = this.ensureScopeChunks(r, o), s = za(this, r, "branch");
        for (const [c, u] of Object.entries(a)) {
          if (ht(u) === "v3") {
            t.skipped++;
            continue;
          }
          const f = this.getDecryptedChunk(r, o, c);
          if (!f || typeof f != "object") {
            t.errors++;
            continue;
          }
          this.setChunkBlob(r, c, mu(f, s, "branch", r), o), i++, t.migratedChunks++;
        }
      } catch {
        t.errors++;
      } finally {
        this.clearScopeChunkCache(n);
      }
      i > 0 && t.migratedScopes++;
    }
    return t;
  }
  // --- Identity-Bound Secrets: private root lifecycle ---
  // See typedocs/Identity-Bound-Secrets.md. These are thin delegations to
  // identity-context.ts (lifecycle) and identity-migration.ts (v3->v4);
  // the crypto itself lives in identity-root.ts / crypto.ts.
  /** Whether this kernel has ever created/imported an identity root (locked or not). */
  hasIdentityRoot() {
    return Wf(this);
  }
  /** Whether the identity root is currently unwrapped in this session. */
  isIdentityUnlocked() {
    return Hf(this);
  }
  /**
   * The current root's public, non-secret identifier — or null if none.
   * Named `currentIdentityRootId` (not `identityRootId`) because the raw
   * `identityRootId` string field already lives directly on kernel state
   * (see kernel-state.ts) — a same-named method would be shadowed by that
   * own data property the moment the instance is constructed.
   */
  currentIdentityRootId() {
    return qf(this);
  }
  /**
   * Create a brand-new identity root, wrap it under `password`, and leave it
   * unlocked for the remainder of this session. Throws if a root already
   * exists — use `rotateIdentityRoot()` to replace one explicitly.
   */
  async createIdentityRoot(t, n) {
    return Gf(this, t, n);
  }
  /**
   * Unlock the identity root for this session. Per Option B this never
   * restores branch `_()`/`~()` secrets — only `_()`/`~()` themselves do
   * that, explicitly, per scope. Throws on a wrong password.
   */
  async unlockIdentity(t) {
    return Jf(this, t);
  }
  /**
   * Lock the identity: wipe the unwrapped root and every derived-key /
   * decrypted-plaintext cache, and clear session-supplied `_()`/`~()`
   * values. See identity-context.ts for the documented limits of
   * JavaScript memory scrubbing this relies on.
   */
  lockIdentity() {
    return Xf(this);
  }
  /**
   * Change the password protecting the identity root. Re-wraps the SAME
   * root under the new password; branch ciphertext is untouched. Distinct
   * from `rotateIdentityRoot()` — never treat the two as interchangeable.
   */
  async changeIdentityPassword(t, n) {
    return Yf(this, t, n);
  }
  /**
   * Replace the identity root with a brand-new, independently-random one.
   * A real "rotate + re-encrypt every scope" migration platform is out of
   * scope for this phase (see typedocs/Identity-Bound-Secrets.md) — this
   * mints the new root/rootId and requires the caller to acknowledge that
   * v4 ciphertext under the OLD root becomes undecryptable from the new
   * one. v3 ciphertext is unaffected either way.
   */
  async rotateIdentityRoot(t, n) {
    return Zf(this, t, n);
  }
  /**
   * Export the wrapped (ciphertext) root envelope for backup. Never returns
   * the raw root. Safe to persist/transmit; it is still password-protected.
   */
  exportIdentityRootBackup() {
    return Qf(this);
  }
  /**
   * Restore a previously-exported envelope. Per Option B this never
   * auto-unlocks or auto-restores branch secrets — call `unlockIdentity()`
   * afterward. Refuses to overwrite a different existing root unless
   * `{ force: true }` is passed explicitly.
   */
  importIdentityRootBackup(t, n) {
    return ed(this, t, n);
  }
  /**
   * Re-encrypt existing v3 branch chunks into v4, scope by scope. Only
   * touches scopes whose secret is currently available AND whose identity
   * is unlocked; anything else is recorded pending and left untouched.
   * Resumable and idempotent — safe to call repeatedly as more secrets
   * become available in later sessions.
   * @internal Maintenance helper for the v3->v4 migration.
   */
  migrateEncryptedBranchesToV4() {
    return td(this);
  }
  /**
   * Re-encrypt existing v3 root-scope value blobs into v4. Does not mutate
   * historical memory-log entries (would break hash-chain integrity,
   * axiom A8) — instead re-asserts each plaintext through the normal write
   * path, appending a new v4-encrypted memory entry. See
   * identity-migration.ts for the full reasoning.
   * @internal Maintenance helper for the v3->v4 migration.
   */
  migrateEncryptedValuesToV4() {
    return nd(this);
  }
  bumpSecretEpoch() {
    return ae(this);
  }
  normalizeArgs(t) {
    return Vf(t);
  }
  /**
   * Internal escape hatch for tests and controlled rollback verification.
   * Not part of the public runtime surface.
   */
  setSecretBlobVersionForTesting(t) {
    this.secretBlobVersion = t;
  }
  opKind(t) {
    return ye(this.operators, t);
  }
  isSecretScopeCall(t, n) {
    return qi(this.operators, t, n);
  }
  isNoiseScopeCall(t, n) {
    return Gr(this.operators, t, n);
  }
  isPointerCall(t, n) {
    return Gi(this.operators, t, n);
  }
  isIdentityCall(t, n) {
    return Ji(this.operators, t, n);
  }
  isEvalCall(t, n) {
    return Jr(this.operators, t, n);
  }
  isQueryCall(t, n) {
    return Xr(this.operators, t, n);
  }
  isDefineOpCall(t, n) {
    return qr(t, n);
  }
  getPrevMemoryHash() {
    return qn(this);
  }
  extractExpressionRefs(t) {
    return is(t);
  }
  resolveRefPath(t, n) {
    return cs(this, t, n);
  }
  unregisterDerivation(t) {
    return wo(this, t);
  }
  getRefVersion(t) {
    return Qn(this, t);
  }
  bumpRefVersion(t) {
    return Rn(this, t);
  }
  snapshotDerivationRefVersions(t) {
    return ko(this, t);
  }
  registerDerivation(t, n, r) {
    return ys(this, t, n, r);
  }
  recomputeTarget(t) {
    return Rr(this, t);
  }
  isDerivationVersionStale(t) {
    return gs(this, t);
  }
  ensureTargetFresh(t) {
    return In(this, t);
  }
  invalidateFromPath(t) {
    return Pn(this, t);
  }
  clearDerivationsByPrefix(t) {
    return xs(this, t);
  }
  commitMemoryOnly(t, n, r, o) {
    return Je(this, t, n, r, o);
  }
  commitValueMapping(t, n, r = null) {
    return Ee(this, t, n, r);
  }
  /**
   * @internal Escape hatch for controlled benchmarks that need the real batch writer
   * without going through the semantic proxy surface.
   */
  _commitIndexedBatch(t, n, r, o = null) {
    return af(this, t, n, r, o);
  }
  /**
   * @internal Benchmark hook: enable per-persist sizing metrics without routing
   * through the semantic proxy plane.
   */
  _enablePersistSecretBranchDebug(t = !0) {
    return this.__persistSecretBranchDebug = {
      enabled: t,
      window: {
        writes: 0,
        columnarWrites: 0,
        maxBranchBytes: 0,
        maxCacheSeedBytes: 0,
        maxEncryptableBytes: 0,
        maxBlobBytes: 0,
        totalLoadChunkMs: 0,
        totalMaterializeMs: 0,
        totalCloneMs: 0,
        totalColumnarMaterializeMs: 0,
        totalPrepareColumnarMs: 0,
        totalKeyDeriveMs: 0,
        totalEncryptMs: 0,
        totalSetBlobMs: 0,
        maxLoadChunkMs: 0,
        maxMaterializeMs: 0,
        maxCloneMs: 0,
        maxColumnarMaterializeMs: 0,
        maxPrepareColumnarMs: 0,
        maxKeyDeriveMs: 0,
        maxEncryptMs: 0,
        maxSetBlobMs: 0,
        writeCacheHits: 0,
        writeCacheMisses: 0,
        totalWriteCacheHitMs: 0,
        maxWriteCacheHitMs: 0
      }
    }, this;
  }
  /**
   * @internal Benchmark hook: drain the current persistSecretBranch window.
   */
  _takePersistSecretBranchDebugWindow() {
    const t = {
      writes: 0,
      columnarWrites: 0,
      maxBranchBytes: 0,
      maxCacheSeedBytes: 0,
      maxEncryptableBytes: 0,
      maxBlobBytes: 0,
      totalLoadChunkMs: 0,
      totalMaterializeMs: 0,
      totalCloneMs: 0,
      totalColumnarMaterializeMs: 0,
      totalPrepareColumnarMs: 0,
      totalKeyDeriveMs: 0,
      totalEncryptMs: 0,
      totalSetBlobMs: 0,
      maxLoadChunkMs: 0,
      maxMaterializeMs: 0,
      maxCloneMs: 0,
      maxColumnarMaterializeMs: 0,
      maxPrepareColumnarMs: 0,
      maxKeyDeriveMs: 0,
      maxEncryptMs: 0,
      maxSetBlobMs: 0,
      writeCacheHits: 0,
      writeCacheMisses: 0,
      totalWriteCacheHitMs: 0,
      maxWriteCacheHitMs: 0
    }, n = this.__persistSecretBranchDebug, r = n?.window ? { ...n.window } : t;
    return n && (n.window = { ...t }), r;
  }
  /**
   * @internal Benchmark hook: configure the write-path chunk cache used only by
   * mutation flows. Disabled by default.
   */
  _configureWriteBranchCache(t = !0, n = 8) {
    return this.__writeBranchCacheConfig = {
      enabled: t,
      limit: Math.max(1, Math.floor(n || 1))
    }, t || this.writeBranchCache.clear(), this;
  }
  /**
   * @internal Benchmark hook: enable blob crypto allocation telemetry.
   */
  _enableBlobCryptoDebug(t = !0) {
    return Qc(t), this;
  }
  /**
   * @internal Benchmark hook: drain the current blob crypto telemetry window.
   */
  _takeBlobCryptoDebugWindow() {
    return eu();
  }
  /**
   * @internal Benchmark hook: enable DiskStore serialization/allocation telemetry.
   */
  _enableDiskStoreDebug(t = !0) {
    return _f(t), this;
  }
  /**
   * @internal Benchmark hook: drain the current DiskStore telemetry window.
   */
  _takeDiskStoreDebugWindow() {
    return Rf();
  }
  /**
   * @internal Benchmark hook: enable getDecryptedChunk cache/decrypt metrics.
   */
  _enableDecryptedChunkDebug(t = !0) {
    return this.__decryptedChunkDebug = {
      enabled: t,
      window: {
        calls: 0,
        hits: 0,
        misses: 0,
        v2Misses: 0,
        v3Misses: 0,
        totalHitMs: 0,
        totalMissMs: 0,
        totalDecryptMs: 0,
        totalDecodeMs: 0,
        maxHitMs: 0,
        maxMissMs: 0,
        maxDecryptMs: 0,
        maxDecodeMs: 0
      }
    }, this;
  }
  /**
   * @internal Benchmark hook: drain the current getDecryptedChunk window.
   */
  _takeDecryptedChunkDebugWindow() {
    const t = {
      calls: 0,
      hits: 0,
      misses: 0,
      v2Misses: 0,
      v3Misses: 0,
      totalHitMs: 0,
      totalMissMs: 0,
      totalDecryptMs: 0,
      totalDecodeMs: 0,
      maxHitMs: 0,
      maxMissMs: 0,
      maxDecryptMs: 0,
      maxDecodeMs: 0
    }, n = this.__decryptedChunkDebug, r = n?.window ? { ...n.window } : t;
    return n && (n.window = { ...t }), r;
  }
  commitMapping(t, n = null) {
    return Ps(this, t, n);
  }
  tryResolveEvalTokenValue(t, n) {
    return Qa(this, t, n);
  }
  tokenizeEvalExpression(t) {
    return xo(t);
  }
  tryEvaluateAssignExpression(t, n) {
    return vo(this, t, n);
  }
  postulate(t, n, r = null) {
    return jn(this, t, n, r);
  }
  removeSubtree(t) {
    return lf(this, t);
  }
  computeEffectiveSecret(t) {
    return oe(this, t);
  }
  applyMemoryToIndex(t) {
    return Ns(this, t);
  }
  removeIndexPrefix(t) {
    return js(this, t);
  }
  rebuildIndex() {
    return ff(this);
  }
  getIndex(t) {
    return ut(this, t);
  }
  setIndex(t, n) {
    return df(this, t, n);
  }
  resolveIndexPointerPath(t, n = 8) {
    return Do(this, t, n);
  }
  chunkCacheKey(t, n) {
    return ct(t, n);
  }
  clearScopeChunkCache(t) {
    return He(this, t);
  }
  getChunkId(t, n) {
    return Ze(this, t, n);
  }
  setAtPath(t, n, r) {
    return Xn(t, n, r);
  }
  flattenLeaves(t, n, r) {
    return mo(t, n, r);
  }
  migrateLegacyScopeToChunks(t, n, r) {
    return Za(this, t, n, r);
  }
  ensureScopeChunks(t, n) {
    return go(this, t, n);
  }
  getChunkBlob(t, n) {
    return Yn(this, t, n);
  }
  setChunkBlob(t, n, r, o) {
    return bo(this, t, n, r, o);
  }
  getDecryptedChunk(t, n, r) {
    return he(this, t, n, r);
  }
  resolveBranchScope(t) {
    return me(this, t);
  }
  normalizeSelectorPath(t) {
    return F(t);
  }
  pathContainsIterator(t) {
    return ma(t);
  }
  substituteIteratorInPath(t, n) {
    return uo(t, n);
  }
  substituteIteratorInExpression(t, n) {
    return ga(t, n);
  }
  collectIteratorIndices(t) {
    return Bo(this, t);
  }
  parseFilterExpression(t) {
    return ba(t);
  }
  parseLogicalFilterExpression(t) {
    return Ye(t);
  }
  compareValues(t, n, r) {
    return xa(t, n, r);
  }
  parseLiteralOrPath(t) {
    return va(t);
  }
  resolveRelativeFirst(t, n) {
    return jr(this, t, n);
  }
  evaluateFilterClauseForScope(t, n) {
    return Kr(this, t, n);
  }
  evaluateLogicalFilterForScope(t, n) {
    return _o(this, t, n);
  }
  collectChildrenForPrefix(t) {
    return er(this, t);
  }
  parseSelectorSegment(t) {
    return Be(t);
  }
  parseSelectorKeys(t) {
    return lo(t);
  }
  parseTransformSelector(t) {
    return kn(t);
  }
  evaluateTransformPath(t) {
    return Ss(this, t);
  }
  evaluateSelectionPath(t) {
    return ws(this, t);
  }
  buildPublicSubtree(t) {
    return Ro(this, t);
  }
  evaluateFilterPath(t) {
    return ks(this, t);
  }
  pathContainsFilterSelector(t) {
    return Es(this, t);
  }
  collectFilteredScopes(t) {
    return Ms(this, t);
  }
  isStealthBlocked(t, n) {
    if (n === void 0) return !1;
    const r = F(t);
    for (let o = r.length; o >= 0; o--) {
      const i = r.slice(0, o).join("."), a = this.localSecrets[i];
      if (a !== void 0 && a !== n)
        return !0;
    }
    return !1;
  }
  /**
   * Root string read for a string the path-expression parser classified (path-expr.ts, handleCall.ts):
   * - aggregate (`x[]`, `x[].f`): evaluated in the public-view context for EVERY caller (contract v4.1 §2.3), so
   *   the owner, `me.as(null)` and `me.as(key)` get the same value; nothing is written;
   * - rejected form (any route): `undefined`; nothing is written.
   * Plain and quoted-literal strings never come here: they keep the 4.1 route (readPath).
   */
  readPathExpression(t, n) {
    if (t.kind === "aggregate")
      return Ba(this, t.ref, "public-view").value;
  }
  readPath(t) {
    const n = this._currentCallerScope, r = F(t);
    if (!this.isStealthBlocked(r, n))
      return Bf(this, t);
  }
  /**
   * Return a handle bound to a caller scope for stealth reads.
   *
   * - `me.as(null)` — guest: paths under a `_()` secret are indistinguishable from
   *   paths that do not exist (`undefined`). **Public** paths remain readable.
   * - `me.as("scope-key")` — key holder: paths under that `_()` secret are readable.
   * - Omit / use the owner `me` — full session privileges (`_currentCallerScope` unset).
   *
   * Always read through the **returned** handle. This is the supported audience API
   * (see axiom A3b). Prefer this over {@link ME.withScope}, which is deprecated.
   *
   * @example
   * ```ts
   * me.shop.label("Cafe");
   * me.ops["_"]("downtown-ops-key");
   * me.ops.beansKg(3);
   *
   * const guest = me.as(null);
   * guest("shop.label");   // "Cafe" — public, still readable
   * guest("ops.beansKg");  // undefined — protected (same as a missing path)
   * guest("ops.missing");  // undefined — does not exist (indistinguishable)
   * me("ops.beansKg");     // 3 — owner
   * ```
   */
  as(t) {
    const n = this._currentCallerScope;
    this._currentCallerScope = t;
    try {
      return this.createProxy([]);
    } finally {
      this._currentCallerScope = n;
    }
  }
  /**
   * @deprecated Does **not** restrict reads the way its name suggests. Prefer {@link ME.as}.
   *
   * `withScope(scope, fn)` only assigns `_currentCallerScope` for the duration of `fn`.
   * Reads through an existing handle (including the owner `me` proxy) re-apply the
   * scope captured when that handle was created, so
   * `withScope(null, () => me("secret.leaf"))` still returns the secret on the owner
   * handle. Guests are not escalated, but the owner is not demoted either.
   *
   * **Do not use this as an authorization boundary.** Migrate to `me.as(key | null)`
   * and perform restricted reads through the returned handle. A guest handle still
   * reads **public** paths; `undefined` means the path is protected *or* absent
   * (those two cases are not distinguishable):
   *
   * ```ts
   * // before (ineffective demotion — do not rely on this)
   * me.withScope(null, () => me("ops.beansKg"));
   *
   * // after
   * const guest = me.as(null);
   * guest("shop.label");  // public value — still readable
   * guest("ops.beansKg"); // undefined — protected or missing (indistinguishable)
   * ```
   *
   * Kept exported for compatibility only; runtime behavior is unchanged (aside from a
   * one-time `console.warn` per process).
   */
  withScope(t, n) {
    Od();
    const r = this._currentCallerScope;
    this._currentCallerScope = t;
    try {
      return n();
    } finally {
      this._currentCallerScope = r;
    }
  }
  isRemoveCall(t, n) {
    return Yr(this.operators, t, n);
  }
  createProxy(t) {
    return zr(this, t);
  }
  describeRuntimeMethod(t, n, r, o) {
    return Q(this, t, n, r, o);
  }
  buildRuntimeSurface() {
    return Gs(this);
  }
  createRuntimeProxy(t) {
    return Kn(this, t);
  }
  describeRuntimeSurface() {
    return Js();
  }
  resolveRuntimeValue(t) {
    return $r(this, t);
  }
};
ee = new WeakMap(), ce = new WeakMap(), Y = new WeakMap(), Pe.RUNTIME_ESCAPE_TOKEN = Ko, Pe.generateP256KeyPair = fa, Pe.exportP256PublicKey = da, Pe.importP256PublicKey = co;
let Ae = Pe;
function Wo(e, t) {
  return e[t] || /* @__PURE__ */ new Set();
}
function Nd(e, t, n) {
  (e[t] || (e[t] = /* @__PURE__ */ new Set())).add(n);
}
function jd(e, t, n) {
  const r = e[t];
  r && (r.delete(n), r.size === 0 && delete e[t]);
}
function Kd() {
  return {
    data: /* @__PURE__ */ new Map(),
    deps: {},
    dependents: {},
    listeners: /* @__PURE__ */ new Map(),
    dirty: /* @__PURE__ */ new Set(),
    scheduled: !1
  };
}
function Vd(e, t, n) {
  e.data.get(t) !== n && (e.data.set(t, n), yc(e, t));
}
function yc(e, t) {
  if (e.dirty.has(t)) return;
  e.dirty.add(t);
  const n = Wo(e.dependents, t);
  for (const r of n)
    yc(e, r);
  Fd(e);
}
function Fd(e) {
  e.scheduled || (e.scheduled = !0, queueMicrotask(() => Ud(e)));
}
function Ud(e) {
  if (e.scheduled = !1, e.dirty.size === 0) return;
  const t = Td(e.dirty, e.deps);
  for (let n = 0; n < t.length; n++) {
    const r = t[n], o = e.data.get(r), i = e.listeners.get(r);
    if (i)
      for (const a of i) a(o);
  }
  e.dirty.clear();
}
function Td(e, t) {
  const n = [], r = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
  function i(a) {
    if (r.has(a) || o.has(a)) return;
    o.add(a);
    const s = Wo(t, a);
    for (const c of s)
      e.has(c) && i(c);
    o.delete(a), r.add(a), n.push(a);
  }
  for (const a of e) i(a);
  return n;
}
function Ld(e, t, n) {
  const r = new Set(n), o = Wo(e.deps, t);
  for (const i of o)
    jd(e.dependents, i, t);
  e.deps[t] = r;
  for (const i of r)
    Nd(e.dependents, i, t);
}
function $d(e, t, n) {
  e.listeners.has(t) || e.listeners.set(t, /* @__PURE__ */ new Set());
  const r = e.listeners.get(t);
  return r.add(n), () => {
    r.delete(n), r.size === 0 && e.listeners.delete(t);
  };
}
function zd(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Wd(e) {
  return zd(e);
}
function Hd(e) {
  return String(e || "").trim() ? Xe(e) : "";
}
function qd(e, t) {
  const n = String(t.name || "").trim();
  if (!n) return e;
  const r = je(n), o = String(t.displayName || n).trim() || n, i = Hd(String(t.space || t.namespace || ""));
  return e["@"](r), e.profile.name(o), e.profile.username(r), i && (e.profile.rootNamespace(i), e.profile.namespace(`${r}.${i}`)), e;
}
function mc(e, t, n) {
  if (!Wd(e)) {
    if (typeof t == "string") {
      if (typeof e != "string")
        throw new Error("COMPOUND_SEED_WHO_REQUIRED");
      return new Ae(e, t, n);
    }
    return new Ae(e, t);
  }
  const r = e.options ?? (typeof t == "string" ? n : t), o = new Ae(e.seed, r);
  return qd(o, e);
}
function Ho(e, t, n) {
  return mc(e, t, n);
}
Object.setPrototypeOf(Ho, Ae);
Ho.prototype = Ae.prototype;
const U = Ho;
U.ME = Ae;
U.createThisMe = mc;
U.parseMeUri = Hr;
U.tryParseMeUri = _c;
U.parseCanonicalMeUri = Wi;
U.formatCanonicalMeUri = Tn;
U.canonicalizeLegacyAtOperator = Rc;
U.canonicalizeHumanIdentity = Hi;
U.projectDnsHostToNamespace = Ic;
U.normalizeCanonicalHandle = je;
U.normalizeCanonicalSpace = Xe;
U.DiskStore = Df;
U.MemoryStore = Hs;
U.createMe = Kd;
U.write = Vd;
U.define = Ld;
U.subscribe = $d;
U.normalizeProofMessage = wn;
U.verifyEd25519Signature = Mu;
U.deriveHkdfBytes = ua;
U.generateIdentityRoot = Uo;
U.wrapIdentityRoot = tr;
U.unwrapIdentityRoot = nr;
U.changeIdentityRootPassword = tc;
export {
  Ae as ME,
  Hi as canonicalizeHumanIdentity,
  Rc as canonicalizeLegacyAtOperator,
  tc as changeIdentityRootPassword,
  mc as createThisMe,
  U as default,
  wu as deriveBranchProofSeed,
  ua as deriveHkdfBytes,
  Au as exportEd25519PublicKey,
  Tn as formatCanonicalMeUri,
  Uo as generateIdentityRoot,
  ku as importEd25519SigningKey,
  je as normalizeCanonicalHandle,
  Xe as normalizeCanonicalSpace,
  wn as normalizeProofMessage,
  Wi as parseCanonicalMeUri,
  Hr as parseMeUri,
  Ic as projectDnsHostToNamespace,
  Eu as signEd25519Proof,
  _c as tryParseMeUri,
  nr as unwrapIdentityRoot,
  Mu as verifyEd25519Signature,
  tr as wrapIdentityRoot
};
