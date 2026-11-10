(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const Ga="180",Vc=0,po=1,$c=2,Nl=1,Ol=2,Tn=3,Hn=0,zt=1,hn=2,Bn=0,Di=1,mo=2,go=3,_o=4,Wc=5,Jn=100,Xc=101,Yc=102,qc=103,jc=104,Kc=200,Zc=201,Jc=202,Qc=203,Jr=204,Qr=205,ed=206,td=207,nd=208,id=209,sd=210,rd=211,ad=212,od=213,ld=214,ea=0,ta=1,na=2,Ni=3,ia=4,sa=5,ra=6,aa=7,Fl=0,cd=1,dd=2,kn=0,hd=1,ud=2,fd=3,Bl=4,pd=5,md=6,gd=7,kl=300,Oi=301,Fi=302,oa=303,la=304,lr=306,ca=1e3,ti=1001,da=1002,qt=1003,_d=1004,ps=1005,un=1006,vr=1007,ni=1008,mn=1009,Hl=1010,zl=1011,ns=1012,Va=1013,ri=1014,fn=1015,ls=1016,$a=1017,Wa=1018,is=1020,Gl=35902,Vl=35899,$l=1021,Wl=1022,on=1023,ss=1026,rs=1027,Xa=1028,Ya=1029,Xl=1030,qa=1031,ja=1033,Ws=33776,Xs=33777,Ys=33778,qs=33779,ha=35840,ua=35841,fa=35842,pa=35843,ma=36196,ga=37492,_a=37496,va=37808,xa=37809,Ma=37810,ya=37811,Sa=37812,Ea=37813,ba=37814,Ta=37815,Aa=37816,wa=37817,Ra=37818,Ca=37819,Ia=37820,Pa=37821,La=36492,Da=36494,Ua=36495,Na=36283,Oa=36284,Fa=36285,Ba=36286,vd=3200,xd=3201,Yl=0,Md=1,On="",Xt="srgb",Bi="srgb-linear",Qs="linear",et="srgb",fi=7680,vo=519,yd=512,Sd=513,Ed=514,ql=515,bd=516,Td=517,Ad=518,wd=519,xo=35044,Mo="300 es",pn=2e3,er=2001;class Gi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const Ct=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],js=Math.PI/180,tr=180/Math.PI;function cs(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ct[i&255]+Ct[i>>8&255]+Ct[i>>16&255]+Ct[i>>24&255]+"-"+Ct[e&255]+Ct[e>>8&255]+"-"+Ct[e>>16&15|64]+Ct[e>>24&255]+"-"+Ct[t&63|128]+Ct[t>>8&255]+"-"+Ct[t>>16&255]+Ct[t>>24&255]+Ct[n&255]+Ct[n>>8&255]+Ct[n>>16&255]+Ct[n>>24&255]).toLowerCase()}function We(i,e,t){return Math.max(e,Math.min(t,i))}function Rd(i,e){return(i%e+e)%e}function xr(i,e,t){return(1-t)*i+t*e}function Yi(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function kt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class qe{constructor(e=0,t=0){qe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(We(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ds{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let c=n[s+0],l=n[s+1],d=n[s+2],h=n[s+3];const f=r[a+0],p=r[a+1],g=r[a+2],_=r[a+3];if(o===0){e[t+0]=c,e[t+1]=l,e[t+2]=d,e[t+3]=h;return}if(o===1){e[t+0]=f,e[t+1]=p,e[t+2]=g,e[t+3]=_;return}if(h!==_||c!==f||l!==p||d!==g){let m=1-o;const u=c*f+l*p+d*g+h*_,E=u>=0?1:-1,T=1-u*u;if(T>Number.EPSILON){const w=Math.sqrt(T),R=Math.atan2(w,u*E);m=Math.sin(m*R)/w,o=Math.sin(o*R)/w}const S=o*E;if(c=c*m+f*S,l=l*m+p*S,d=d*m+g*S,h=h*m+_*S,m===1-o){const w=1/Math.sqrt(c*c+l*l+d*d+h*h);c*=w,l*=w,d*=w,h*=w}}e[t]=c,e[t+1]=l,e[t+2]=d,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],c=n[s+1],l=n[s+2],d=n[s+3],h=r[a],f=r[a+1],p=r[a+2],g=r[a+3];return e[t]=o*g+d*h+c*p-l*f,e[t+1]=c*g+d*f+l*h-o*p,e[t+2]=l*g+d*p+o*f-c*h,e[t+3]=d*g-o*h-c*f-l*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(n/2),d=o(s/2),h=o(r/2),f=c(n/2),p=c(s/2),g=c(r/2);switch(a){case"XYZ":this._x=f*d*h+l*p*g,this._y=l*p*h-f*d*g,this._z=l*d*g+f*p*h,this._w=l*d*h-f*p*g;break;case"YXZ":this._x=f*d*h+l*p*g,this._y=l*p*h-f*d*g,this._z=l*d*g-f*p*h,this._w=l*d*h+f*p*g;break;case"ZXY":this._x=f*d*h-l*p*g,this._y=l*p*h+f*d*g,this._z=l*d*g+f*p*h,this._w=l*d*h-f*p*g;break;case"ZYX":this._x=f*d*h-l*p*g,this._y=l*p*h+f*d*g,this._z=l*d*g-f*p*h,this._w=l*d*h+f*p*g;break;case"YZX":this._x=f*d*h+l*p*g,this._y=l*p*h+f*d*g,this._z=l*d*g-f*p*h,this._w=l*d*h-f*p*g;break;case"XZY":this._x=f*d*h-l*p*g,this._y=l*p*h-f*d*g,this._z=l*d*g+f*p*h,this._w=l*d*h+f*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],d=t[6],h=t[10],f=n+o+h;if(f>0){const p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(d-c)*p,this._y=(r-l)*p,this._z=(a-s)*p}else if(n>o&&n>h){const p=2*Math.sqrt(1+n-o-h);this._w=(d-c)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+l)/p}else if(o>h){const p=2*Math.sqrt(1+o-n-h);this._w=(r-l)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(c+d)/p}else{const p=2*Math.sqrt(1+h-n-o);this._w=(a-s)/p,this._x=(r+l)/p,this._y=(c+d)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(We(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,d=t._w;return this._x=n*d+a*o+s*l-r*c,this._y=s*d+a*c+r*o-n*l,this._z=r*d+a*l+n*c-s*o,this._w=a*d-n*o-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,s=this._y,r=this._z,a=this._w;let o=a*e._w+n*e._x+s*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;const c=1-o*o;if(c<=Number.EPSILON){const p=1-t;return this._w=p*a+t*this._w,this._x=p*n+t*this._x,this._y=p*s+t*this._y,this._z=p*r+t*this._z,this.normalize(),this}const l=Math.sqrt(c),d=Math.atan2(l,o),h=Math.sin((1-t)*d)/l,f=Math.sin(t*d)/l;return this._w=a*h+this._w*f,this._x=n*h+this._x*f,this._y=s*h+this._y*f,this._z=r*h+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class O{constructor(e=0,t=0,n=0){O.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(yo.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(yo.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*s-o*n),d=2*(o*t-r*s),h=2*(r*n-a*t);return this.x=t+c*l+a*h-o*d,this.y=n+c*d+o*l-r*h,this.z=s+c*h+r*d-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Mr.copy(this).projectOnVector(e),this.sub(Mr)}reflect(e){return this.sub(Mr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(We(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Mr=new O,yo=new ds;class Be{constructor(e,t,n,s,r,a,o,c,l){Be.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l)}set(e,t,n,s,r,a,o,c,l){const d=this.elements;return d[0]=e,d[1]=s,d[2]=o,d[3]=t,d[4]=r,d[5]=c,d[6]=n,d[7]=a,d[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],d=n[4],h=n[7],f=n[2],p=n[5],g=n[8],_=s[0],m=s[3],u=s[6],E=s[1],T=s[4],S=s[7],w=s[2],R=s[5],A=s[8];return r[0]=a*_+o*E+c*w,r[3]=a*m+o*T+c*R,r[6]=a*u+o*S+c*A,r[1]=l*_+d*E+h*w,r[4]=l*m+d*T+h*R,r[7]=l*u+d*S+h*A,r[2]=f*_+p*E+g*w,r[5]=f*m+p*T+g*R,r[8]=f*u+p*S+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],d=e[8];return t*a*d-t*o*l-n*r*d+n*o*c+s*r*l-s*a*c}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],d=e[8],h=d*a-o*l,f=o*c-d*r,p=l*r-a*c,g=t*h+n*f+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=h*_,e[1]=(s*l-d*n)*_,e[2]=(o*n-s*a)*_,e[3]=f*_,e[4]=(d*t-s*c)*_,e[5]=(s*r-o*t)*_,e[6]=p*_,e[7]=(n*c-l*t)*_,e[8]=(a*t-n*r)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*a+l*o)+a+e,-s*l,s*c,-s*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(yr.makeScale(e,t)),this}rotate(e){return this.premultiply(yr.makeRotation(-e)),this}translate(e,t){return this.premultiply(yr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const yr=new Be;function jl(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function nr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Cd(){const i=nr("canvas");return i.style.display="block",i}const So={};function as(i){i in So||(So[i]=!0,console.warn(i))}function Id(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const Eo=new Be().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),bo=new Be().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Pd(){const i={enabled:!0,workingColorSpace:Bi,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===et&&(s.r=Rn(s.r),s.g=Rn(s.g),s.b=Rn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===et&&(s.r=Ui(s.r),s.g=Ui(s.g),s.b=Ui(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===On?Qs:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return as("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return as("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Bi]:{primaries:e,whitePoint:n,transfer:Qs,toXYZ:Eo,fromXYZ:bo,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Xt},outputColorSpaceConfig:{drawingBufferColorSpace:Xt}},[Xt]:{primaries:e,whitePoint:n,transfer:et,toXYZ:Eo,fromXYZ:bo,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Xt}}}),i}const Ke=Pd();function Rn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ui(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let pi;class Ld{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{pi===void 0&&(pi=nr("canvas")),pi.width=e.width,pi.height=e.height;const s=pi.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=pi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=nr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Rn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Rn(t[n]/255)*255):t[n]=Rn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Dd=0;class Ka{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Dd++}),this.uuid=cs(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Sr(s[a].image)):r.push(Sr(s[a]))}else r=Sr(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function Sr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Ld.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Ud=0;const Er=new O;class Lt extends Gi{constructor(e=Lt.DEFAULT_IMAGE,t=Lt.DEFAULT_MAPPING,n=ti,s=ti,r=un,a=ni,o=on,c=mn,l=Lt.DEFAULT_ANISOTROPY,d=On){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ud++}),this.uuid=cs(),this.name="",this.source=new Ka(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new qe(0,0),this.repeat=new qe(1,1),this.center=new qe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Be,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Er).x}get height(){return this.source.getSize(Er).y}get depth(){return this.source.getSize(Er).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==kl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ca:e.x=e.x-Math.floor(e.x);break;case ti:e.x=e.x<0?0:1;break;case da:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ca:e.y=e.y-Math.floor(e.y);break;case ti:e.y=e.y<0?0:1;break;case da:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Lt.DEFAULT_IMAGE=null;Lt.DEFAULT_MAPPING=kl;Lt.DEFAULT_ANISOTROPY=1;class ft{constructor(e=0,t=0,n=0,s=1){ft.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const c=e.elements,l=c[0],d=c[4],h=c[8],f=c[1],p=c[5],g=c[9],_=c[2],m=c[6],u=c[10];if(Math.abs(d-f)<.01&&Math.abs(h-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(d+f)<.1&&Math.abs(h+_)<.1&&Math.abs(g+m)<.1&&Math.abs(l+p+u-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const T=(l+1)/2,S=(p+1)/2,w=(u+1)/2,R=(d+f)/4,A=(h+_)/4,L=(g+m)/4;return T>S&&T>w?T<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(T),s=R/n,r=A/n):S>w?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=R/s,r=L/s):w<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(w),n=A/r,s=L/r),this.set(n,s,r,t),this}let E=Math.sqrt((m-g)*(m-g)+(h-_)*(h-_)+(f-d)*(f-d));return Math.abs(E)<.001&&(E=1),this.x=(m-g)/E,this.y=(h-_)/E,this.z=(f-d)/E,this.w=Math.acos((l+p+u-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this.w=We(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this.w=We(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Nd extends Gi{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:un,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ft(0,0,e,t),this.scissorTest=!1,this.viewport=new ft(0,0,e,t);const s={width:e,height:t,depth:n.depth},r=new Lt(s);this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:un,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new Ka(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ai extends Nd{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Kl extends Lt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=qt,this.minFilter=qt,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Od extends Lt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=qt,this.minFilter=qt,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class ci{constructor(e=new O(1/0,1/0,1/0),t=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(sn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(sn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=sn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,sn):sn.fromBufferAttribute(r,a),sn.applyMatrix4(e.matrixWorld),this.expandByPoint(sn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ms.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ms.copy(n.boundingBox)),ms.applyMatrix4(e.matrixWorld),this.union(ms)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,sn),sn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(qi),gs.subVectors(this.max,qi),mi.subVectors(e.a,qi),gi.subVectors(e.b,qi),_i.subVectors(e.c,qi),Cn.subVectors(gi,mi),In.subVectors(_i,gi),$n.subVectors(mi,_i);let t=[0,-Cn.z,Cn.y,0,-In.z,In.y,0,-$n.z,$n.y,Cn.z,0,-Cn.x,In.z,0,-In.x,$n.z,0,-$n.x,-Cn.y,Cn.x,0,-In.y,In.x,0,-$n.y,$n.x,0];return!br(t,mi,gi,_i,gs)||(t=[1,0,0,0,1,0,0,0,1],!br(t,mi,gi,_i,gs))?!1:(_s.crossVectors(Cn,In),t=[_s.x,_s.y,_s.z],br(t,mi,gi,_i,gs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,sn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(sn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Mn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Mn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Mn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Mn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Mn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Mn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Mn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Mn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Mn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Mn=[new O,new O,new O,new O,new O,new O,new O,new O],sn=new O,ms=new ci,mi=new O,gi=new O,_i=new O,Cn=new O,In=new O,$n=new O,qi=new O,gs=new O,_s=new O,Wn=new O;function br(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Wn.fromArray(i,r);const o=s.x*Math.abs(Wn.x)+s.y*Math.abs(Wn.y)+s.z*Math.abs(Wn.z),c=e.dot(Wn),l=t.dot(Wn),d=n.dot(Wn);if(Math.max(-Math.max(c,l,d),Math.min(c,l,d))>o)return!1}return!0}const Fd=new ci,ji=new O,Tr=new O;class Vi{constructor(e=new O,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Fd.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ji.subVectors(e,this.center);const t=ji.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(ji,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Tr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ji.copy(e.center).add(Tr)),this.expandByPoint(ji.copy(e.center).sub(Tr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const yn=new O,Ar=new O,vs=new O,Pn=new O,wr=new O,xs=new O,Rr=new O;class Zl{constructor(e=new O,t=new O(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,yn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=yn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(yn.copy(this.origin).addScaledVector(this.direction,t),yn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Ar.copy(e).add(t).multiplyScalar(.5),vs.copy(t).sub(e).normalize(),Pn.copy(this.origin).sub(Ar);const r=e.distanceTo(t)*.5,a=-this.direction.dot(vs),o=Pn.dot(this.direction),c=-Pn.dot(vs),l=Pn.lengthSq(),d=Math.abs(1-a*a);let h,f,p,g;if(d>0)if(h=a*c-o,f=a*o-c,g=r*d,h>=0)if(f>=-g)if(f<=g){const _=1/d;h*=_,f*=_,p=h*(h+a*f+2*o)+f*(a*h+f+2*c)+l}else f=r,h=Math.max(0,-(a*f+o)),p=-h*h+f*(f+2*c)+l;else f=-r,h=Math.max(0,-(a*f+o)),p=-h*h+f*(f+2*c)+l;else f<=-g?(h=Math.max(0,-(-a*r+o)),f=h>0?-r:Math.min(Math.max(-r,-c),r),p=-h*h+f*(f+2*c)+l):f<=g?(h=0,f=Math.min(Math.max(-r,-c),r),p=f*(f+2*c)+l):(h=Math.max(0,-(a*r+o)),f=h>0?r:Math.min(Math.max(-r,-c),r),p=-h*h+f*(f+2*c)+l);else f=a>0?-r:r,h=Math.max(0,-(a*f+o)),p=-h*h+f*(f+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(Ar).addScaledVector(vs,f),p}intersectSphere(e,t){yn.subVectors(e.center,this.origin);const n=yn.dot(this.direction),s=yn.dot(yn)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,c;const l=1/this.direction.x,d=1/this.direction.y,h=1/this.direction.z,f=this.origin;return l>=0?(n=(e.min.x-f.x)*l,s=(e.max.x-f.x)*l):(n=(e.max.x-f.x)*l,s=(e.min.x-f.x)*l),d>=0?(r=(e.min.y-f.y)*d,a=(e.max.y-f.y)*d):(r=(e.max.y-f.y)*d,a=(e.min.y-f.y)*d),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),h>=0?(o=(e.min.z-f.z)*h,c=(e.max.z-f.z)*h):(o=(e.max.z-f.z)*h,c=(e.min.z-f.z)*h),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,yn)!==null}intersectTriangle(e,t,n,s,r){wr.subVectors(t,e),xs.subVectors(n,e),Rr.crossVectors(wr,xs);let a=this.direction.dot(Rr),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Pn.subVectors(this.origin,e);const c=o*this.direction.dot(xs.crossVectors(Pn,xs));if(c<0)return null;const l=o*this.direction.dot(wr.cross(Pn));if(l<0||c+l>a)return null;const d=-o*Pn.dot(Rr);return d<0?null:this.at(d/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class at{constructor(e,t,n,s,r,a,o,c,l,d,h,f,p,g,_,m){at.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l,d,h,f,p,g,_,m)}set(e,t,n,s,r,a,o,c,l,d,h,f,p,g,_,m){const u=this.elements;return u[0]=e,u[4]=t,u[8]=n,u[12]=s,u[1]=r,u[5]=a,u[9]=o,u[13]=c,u[2]=l,u[6]=d,u[10]=h,u[14]=f,u[3]=p,u[7]=g,u[11]=_,u[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new at().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,s=1/vi.setFromMatrixColumn(e,0).length(),r=1/vi.setFromMatrixColumn(e,1).length(),a=1/vi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),l=Math.sin(s),d=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){const f=a*d,p=a*h,g=o*d,_=o*h;t[0]=c*d,t[4]=-c*h,t[8]=l,t[1]=p+g*l,t[5]=f-_*l,t[9]=-o*c,t[2]=_-f*l,t[6]=g+p*l,t[10]=a*c}else if(e.order==="YXZ"){const f=c*d,p=c*h,g=l*d,_=l*h;t[0]=f+_*o,t[4]=g*o-p,t[8]=a*l,t[1]=a*h,t[5]=a*d,t[9]=-o,t[2]=p*o-g,t[6]=_+f*o,t[10]=a*c}else if(e.order==="ZXY"){const f=c*d,p=c*h,g=l*d,_=l*h;t[0]=f-_*o,t[4]=-a*h,t[8]=g+p*o,t[1]=p+g*o,t[5]=a*d,t[9]=_-f*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){const f=a*d,p=a*h,g=o*d,_=o*h;t[0]=c*d,t[4]=g*l-p,t[8]=f*l+_,t[1]=c*h,t[5]=_*l+f,t[9]=p*l-g,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){const f=a*c,p=a*l,g=o*c,_=o*l;t[0]=c*d,t[4]=_-f*h,t[8]=g*h+p,t[1]=h,t[5]=a*d,t[9]=-o*d,t[2]=-l*d,t[6]=p*h+g,t[10]=f-_*h}else if(e.order==="XZY"){const f=a*c,p=a*l,g=o*c,_=o*l;t[0]=c*d,t[4]=-h,t[8]=l*d,t[1]=f*h+_,t[5]=a*d,t[9]=p*h-g,t[2]=g*h-p,t[6]=o*d,t[10]=_*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Bd,e,kd)}lookAt(e,t,n){const s=this.elements;return $t.subVectors(e,t),$t.lengthSq()===0&&($t.z=1),$t.normalize(),Ln.crossVectors(n,$t),Ln.lengthSq()===0&&(Math.abs(n.z)===1?$t.x+=1e-4:$t.z+=1e-4,$t.normalize(),Ln.crossVectors(n,$t)),Ln.normalize(),Ms.crossVectors($t,Ln),s[0]=Ln.x,s[4]=Ms.x,s[8]=$t.x,s[1]=Ln.y,s[5]=Ms.y,s[9]=$t.y,s[2]=Ln.z,s[6]=Ms.z,s[10]=$t.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],d=n[1],h=n[5],f=n[9],p=n[13],g=n[2],_=n[6],m=n[10],u=n[14],E=n[3],T=n[7],S=n[11],w=n[15],R=s[0],A=s[4],L=s[8],M=s[12],y=s[1],I=s[5],N=s[9],B=s[13],X=s[2],G=s[6],Y=s[10],Z=s[14],$=s[3],oe=s[7],he=s[11],be=s[15];return r[0]=a*R+o*y+c*X+l*$,r[4]=a*A+o*I+c*G+l*oe,r[8]=a*L+o*N+c*Y+l*he,r[12]=a*M+o*B+c*Z+l*be,r[1]=d*R+h*y+f*X+p*$,r[5]=d*A+h*I+f*G+p*oe,r[9]=d*L+h*N+f*Y+p*he,r[13]=d*M+h*B+f*Z+p*be,r[2]=g*R+_*y+m*X+u*$,r[6]=g*A+_*I+m*G+u*oe,r[10]=g*L+_*N+m*Y+u*he,r[14]=g*M+_*B+m*Z+u*be,r[3]=E*R+T*y+S*X+w*$,r[7]=E*A+T*I+S*G+w*oe,r[11]=E*L+T*N+S*Y+w*he,r[15]=E*M+T*B+S*Z+w*be,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],d=e[2],h=e[6],f=e[10],p=e[14],g=e[3],_=e[7],m=e[11],u=e[15];return g*(+r*c*h-s*l*h-r*o*f+n*l*f+s*o*p-n*c*p)+_*(+t*c*p-t*l*f+r*a*f-s*a*p+s*l*d-r*c*d)+m*(+t*l*h-t*o*p-r*a*h+n*a*p+r*o*d-n*l*d)+u*(-s*o*d-t*c*h+t*o*f+s*a*h-n*a*f+n*c*d)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],d=e[8],h=e[9],f=e[10],p=e[11],g=e[12],_=e[13],m=e[14],u=e[15],E=h*m*l-_*f*l+_*c*p-o*m*p-h*c*u+o*f*u,T=g*f*l-d*m*l-g*c*p+a*m*p+d*c*u-a*f*u,S=d*_*l-g*h*l+g*o*p-a*_*p-d*o*u+a*h*u,w=g*h*c-d*_*c-g*o*f+a*_*f+d*o*m-a*h*m,R=t*E+n*T+s*S+r*w;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/R;return e[0]=E*A,e[1]=(_*f*r-h*m*r-_*s*p+n*m*p+h*s*u-n*f*u)*A,e[2]=(o*m*r-_*c*r+_*s*l-n*m*l-o*s*u+n*c*u)*A,e[3]=(h*c*r-o*f*r-h*s*l+n*f*l+o*s*p-n*c*p)*A,e[4]=T*A,e[5]=(d*m*r-g*f*r+g*s*p-t*m*p-d*s*u+t*f*u)*A,e[6]=(g*c*r-a*m*r-g*s*l+t*m*l+a*s*u-t*c*u)*A,e[7]=(a*f*r-d*c*r+d*s*l-t*f*l-a*s*p+t*c*p)*A,e[8]=S*A,e[9]=(g*h*r-d*_*r-g*n*p+t*_*p+d*n*u-t*h*u)*A,e[10]=(a*_*r-g*o*r+g*n*l-t*_*l-a*n*u+t*o*u)*A,e[11]=(d*o*r-a*h*r-d*n*l+t*h*l+a*n*p-t*o*p)*A,e[12]=w*A,e[13]=(d*_*s-g*h*s+g*n*f-t*_*f-d*n*m+t*h*m)*A,e[14]=(g*o*s-a*_*s-g*n*c+t*_*c+a*n*m-t*o*m)*A,e[15]=(a*h*s-d*o*s+d*n*c-t*h*c-a*n*f+t*o*f)*A,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,c=e.z,l=r*a,d=r*o;return this.set(l*a+n,l*o-s*c,l*c+s*o,0,l*o+s*c,d*o+n,d*c-s*a,0,l*c-s*o,d*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,d=a+a,h=o+o,f=r*l,p=r*d,g=r*h,_=a*d,m=a*h,u=o*h,E=c*l,T=c*d,S=c*h,w=n.x,R=n.y,A=n.z;return s[0]=(1-(_+u))*w,s[1]=(p+S)*w,s[2]=(g-T)*w,s[3]=0,s[4]=(p-S)*R,s[5]=(1-(f+u))*R,s[6]=(m+E)*R,s[7]=0,s[8]=(g+T)*A,s[9]=(m-E)*A,s[10]=(1-(f+_))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;let r=vi.set(s[0],s[1],s[2]).length();const a=vi.set(s[4],s[5],s[6]).length(),o=vi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],rn.copy(this);const l=1/r,d=1/a,h=1/o;return rn.elements[0]*=l,rn.elements[1]*=l,rn.elements[2]*=l,rn.elements[4]*=d,rn.elements[5]*=d,rn.elements[6]*=d,rn.elements[8]*=h,rn.elements[9]*=h,rn.elements[10]*=h,t.setFromRotationMatrix(rn),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,s,r,a,o=pn,c=!1){const l=this.elements,d=2*r/(t-e),h=2*r/(n-s),f=(t+e)/(t-e),p=(n+s)/(n-s);let g,_;if(c)g=r/(a-r),_=a*r/(a-r);else if(o===pn)g=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===er)g=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=d,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=h,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=pn,c=!1){const l=this.elements,d=2/(t-e),h=2/(n-s),f=-(t+e)/(t-e),p=-(n+s)/(n-s);let g,_;if(c)g=1/(a-r),_=a/(a-r);else if(o===pn)g=-2/(a-r),_=-(a+r)/(a-r);else if(o===er)g=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=d,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=h,l[9]=0,l[13]=p,l[2]=0,l[6]=0,l[10]=g,l[14]=_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const vi=new O,rn=new at,Bd=new O(0,0,0),kd=new O(1,1,1),Ln=new O,Ms=new O,$t=new O,To=new at,Ao=new ds;class gn{constructor(e=0,t=0,n=0,s=gn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],d=s[9],h=s[2],f=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(We(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-d,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-We(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(We(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-We(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(We(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-d,l),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-We(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-d,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return To.makeRotationFromQuaternion(e),this.setFromRotationMatrix(To,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ao.setFromEuler(this),this.setFromQuaternion(Ao,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}gn.DEFAULT_ORDER="XYZ";class Jl{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Hd=0;const wo=new O,xi=new ds,Sn=new at,ys=new O,Ki=new O,zd=new O,Gd=new ds,Ro=new O(1,0,0),Co=new O(0,1,0),Io=new O(0,0,1),Po={type:"added"},Vd={type:"removed"},Mi={type:"childadded",child:null},Cr={type:"childremoved",child:null};class _t extends Gi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Hd++}),this.uuid=cs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=_t.DEFAULT_UP.clone();const e=new O,t=new gn,n=new ds,s=new O(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new at},normalMatrix:{value:new Be}}),this.matrix=new at,this.matrixWorld=new at,this.matrixAutoUpdate=_t.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=_t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Jl,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return xi.setFromAxisAngle(e,t),this.quaternion.multiply(xi),this}rotateOnWorldAxis(e,t){return xi.setFromAxisAngle(e,t),this.quaternion.premultiply(xi),this}rotateX(e){return this.rotateOnAxis(Ro,e)}rotateY(e){return this.rotateOnAxis(Co,e)}rotateZ(e){return this.rotateOnAxis(Io,e)}translateOnAxis(e,t){return wo.copy(e).applyQuaternion(this.quaternion),this.position.add(wo.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ro,e)}translateY(e){return this.translateOnAxis(Co,e)}translateZ(e){return this.translateOnAxis(Io,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Sn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ys.copy(e):ys.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Ki.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Sn.lookAt(Ki,ys,this.up):Sn.lookAt(ys,Ki,this.up),this.quaternion.setFromRotationMatrix(Sn),s&&(Sn.extractRotation(s.matrixWorld),xi.setFromRotationMatrix(Sn),this.quaternion.premultiply(xi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Po),Mi.child=e,this.dispatchEvent(Mi),Mi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Vd),Cr.child=e,this.dispatchEvent(Cr),Cr.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Sn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Sn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Sn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Po),Mi.child=e,this.dispatchEvent(Mi),Mi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ki,e,zd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ki,Gd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let l=0,d=c.length;l<d;l++){const h=c[l];r(e.shapes,h)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];s.animations.push(r(e.animations,c))}}if(t){const o=a(e.geometries),c=a(e.materials),l=a(e.textures),d=a(e.images),h=a(e.shapes),f=a(e.skeletons),p=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),d.length>0&&(n.images=d),h.length>0&&(n.shapes=h),f.length>0&&(n.skeletons=f),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const c=[];for(const l in o){const d=o[l];delete d.metadata,c.push(d)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}_t.DEFAULT_UP=new O(0,1,0);_t.DEFAULT_MATRIX_AUTO_UPDATE=!0;_t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const an=new O,En=new O,Ir=new O,bn=new O,yi=new O,Si=new O,Lo=new O,Pr=new O,Lr=new O,Dr=new O,Ur=new ft,Nr=new ft,Or=new ft;class tn{constructor(e=new O,t=new O,n=new O){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),an.subVectors(e,t),s.cross(an);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){an.subVectors(s,t),En.subVectors(n,t),Ir.subVectors(e,t);const a=an.dot(an),o=an.dot(En),c=an.dot(Ir),l=En.dot(En),d=En.dot(Ir),h=a*l-o*o;if(h===0)return r.set(0,0,0),null;const f=1/h,p=(l*c-o*d)*f,g=(a*d-o*c)*f;return r.set(1-p-g,g,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,bn)===null?!1:bn.x>=0&&bn.y>=0&&bn.x+bn.y<=1}static getInterpolation(e,t,n,s,r,a,o,c){return this.getBarycoord(e,t,n,s,bn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,bn.x),c.addScaledVector(a,bn.y),c.addScaledVector(o,bn.z),c)}static getInterpolatedAttribute(e,t,n,s,r,a){return Ur.setScalar(0),Nr.setScalar(0),Or.setScalar(0),Ur.fromBufferAttribute(e,t),Nr.fromBufferAttribute(e,n),Or.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Ur,r.x),a.addScaledVector(Nr,r.y),a.addScaledVector(Or,r.z),a}static isFrontFacing(e,t,n,s){return an.subVectors(n,t),En.subVectors(e,t),an.cross(En).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return an.subVectors(this.c,this.b),En.subVectors(this.a,this.b),an.cross(En).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return tn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return tn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return tn.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return tn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return tn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;yi.subVectors(s,n),Si.subVectors(r,n),Pr.subVectors(e,n);const c=yi.dot(Pr),l=Si.dot(Pr);if(c<=0&&l<=0)return t.copy(n);Lr.subVectors(e,s);const d=yi.dot(Lr),h=Si.dot(Lr);if(d>=0&&h<=d)return t.copy(s);const f=c*h-d*l;if(f<=0&&c>=0&&d<=0)return a=c/(c-d),t.copy(n).addScaledVector(yi,a);Dr.subVectors(e,r);const p=yi.dot(Dr),g=Si.dot(Dr);if(g>=0&&p<=g)return t.copy(r);const _=p*l-c*g;if(_<=0&&l>=0&&g<=0)return o=l/(l-g),t.copy(n).addScaledVector(Si,o);const m=d*g-p*h;if(m<=0&&h-d>=0&&p-g>=0)return Lo.subVectors(r,s),o=(h-d)/(h-d+(p-g)),t.copy(s).addScaledVector(Lo,o);const u=1/(m+_+f);return a=_*u,o=f*u,t.copy(n).addScaledVector(yi,a).addScaledVector(Si,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Ql={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Dn={h:0,s:0,l:0},Ss={h:0,s:0,l:0};function Fr(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class ze{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Xt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ke.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Ke.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ke.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Ke.workingColorSpace){if(e=Rd(e,1),t=We(t,0,1),n=We(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Fr(a,r,e+1/3),this.g=Fr(a,r,e),this.b=Fr(a,r,e-1/3)}return Ke.colorSpaceToWorking(this,s),this}setStyle(e,t=Xt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Xt){const n=Ql[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Rn(e.r),this.g=Rn(e.g),this.b=Rn(e.b),this}copyLinearToSRGB(e){return this.r=Ui(e.r),this.g=Ui(e.g),this.b=Ui(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Xt){return Ke.workingToColorSpace(It.copy(this),e),Math.round(We(It.r*255,0,255))*65536+Math.round(We(It.g*255,0,255))*256+Math.round(We(It.b*255,0,255))}getHexString(e=Xt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ke.workingColorSpace){Ke.workingToColorSpace(It.copy(this),t);const n=It.r,s=It.g,r=It.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let c,l;const d=(o+a)/2;if(o===a)c=0,l=0;else{const h=a-o;switch(l=d<=.5?h/(a+o):h/(2-a-o),a){case n:c=(s-r)/h+(s<r?6:0);break;case s:c=(r-n)/h+2;break;case r:c=(n-s)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=d,e}getRGB(e,t=Ke.workingColorSpace){return Ke.workingToColorSpace(It.copy(this),t),e.r=It.r,e.g=It.g,e.b=It.b,e}getStyle(e=Xt){Ke.workingToColorSpace(It.copy(this),e);const t=It.r,n=It.g,s=It.b;return e!==Xt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Dn),this.setHSL(Dn.h+e,Dn.s+t,Dn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Dn),e.getHSL(Ss);const n=xr(Dn.h,Ss.h,t),s=xr(Dn.s,Ss.s,t),r=xr(Dn.l,Ss.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const It=new ze;ze.NAMES=Ql;let $d=0;class $i extends Gi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:$d++}),this.uuid=cs(),this.name="",this.type="Material",this.blending=Di,this.side=Hn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Jr,this.blendDst=Qr,this.blendEquation=Jn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ze(0,0,0),this.blendAlpha=0,this.depthFunc=Ni,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=vo,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=fi,this.stencilZFail=fi,this.stencilZPass=fi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Di&&(n.blending=this.blending),this.side!==Hn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Jr&&(n.blendSrc=this.blendSrc),this.blendDst!==Qr&&(n.blendDst=this.blendDst),this.blendEquation!==Jn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ni&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==vo&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==fi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==fi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==fi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const c=r[o];delete c.metadata,a.push(c)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Ii extends $i{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ze(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gn,this.combine=Fl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const vt=new O,Es=new qe;let Wd=0;class ln{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Wd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=xo,this.updateRanges=[],this.gpuType=fn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Es.fromBufferAttribute(this,t),Es.applyMatrix3(e),this.setXY(t,Es.x,Es.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix3(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix4(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyNormalMatrix(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.transformDirection(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Yi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=kt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Yi(t,this.array)),t}setX(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Yi(t,this.array)),t}setY(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Yi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Yi(t,this.array)),t}setW(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=kt(t,this.array),n=kt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=kt(t,this.array),n=kt(n,this.array),s=kt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=kt(t,this.array),n=kt(n,this.array),s=kt(s,this.array),r=kt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==xo&&(e.usage=this.usage),e}}class ec extends ln{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class tc extends ln{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class pt extends ln{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Xd=0;const Qt=new at,Br=new _t,Ei=new O,Wt=new ci,Zi=new ci,Tt=new O;class jt extends Gi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Xd++}),this.uuid=cs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(jl(e)?tc:ec)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Be().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Qt.makeRotationFromQuaternion(e),this.applyMatrix4(Qt),this}rotateX(e){return Qt.makeRotationX(e),this.applyMatrix4(Qt),this}rotateY(e){return Qt.makeRotationY(e),this.applyMatrix4(Qt),this}rotateZ(e){return Qt.makeRotationZ(e),this.applyMatrix4(Qt),this}translate(e,t,n){return Qt.makeTranslation(e,t,n),this.applyMatrix4(Qt),this}scale(e,t,n){return Qt.makeScale(e,t,n),this.applyMatrix4(Qt),this}lookAt(e){return Br.lookAt(e),Br.updateMatrix(),this.applyMatrix4(Br.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ei).negate(),this.translate(Ei.x,Ei.y,Ei.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new pt(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ci);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];Wt.setFromBufferAttribute(r),this.morphTargetsRelative?(Tt.addVectors(this.boundingBox.min,Wt.min),this.boundingBox.expandByPoint(Tt),Tt.addVectors(this.boundingBox.max,Wt.max),this.boundingBox.expandByPoint(Tt)):(this.boundingBox.expandByPoint(Wt.min),this.boundingBox.expandByPoint(Wt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Vi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(e){const n=this.boundingSphere.center;if(Wt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];Zi.setFromBufferAttribute(o),this.morphTargetsRelative?(Tt.addVectors(Wt.min,Zi.min),Wt.expandByPoint(Tt),Tt.addVectors(Wt.max,Zi.max),Wt.expandByPoint(Tt)):(Wt.expandByPoint(Zi.min),Wt.expandByPoint(Zi.max))}Wt.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Tt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Tt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],c=this.morphTargetsRelative;for(let l=0,d=o.count;l<d;l++)Tt.fromBufferAttribute(o,l),c&&(Ei.fromBufferAttribute(e,l),Tt.add(Ei)),s=Math.max(s,n.distanceToSquared(Tt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new ln(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],c=[];for(let L=0;L<n.count;L++)o[L]=new O,c[L]=new O;const l=new O,d=new O,h=new O,f=new qe,p=new qe,g=new qe,_=new O,m=new O;function u(L,M,y){l.fromBufferAttribute(n,L),d.fromBufferAttribute(n,M),h.fromBufferAttribute(n,y),f.fromBufferAttribute(r,L),p.fromBufferAttribute(r,M),g.fromBufferAttribute(r,y),d.sub(l),h.sub(l),p.sub(f),g.sub(f);const I=1/(p.x*g.y-g.x*p.y);isFinite(I)&&(_.copy(d).multiplyScalar(g.y).addScaledVector(h,-p.y).multiplyScalar(I),m.copy(h).multiplyScalar(p.x).addScaledVector(d,-g.x).multiplyScalar(I),o[L].add(_),o[M].add(_),o[y].add(_),c[L].add(m),c[M].add(m),c[y].add(m))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let L=0,M=E.length;L<M;++L){const y=E[L],I=y.start,N=y.count;for(let B=I,X=I+N;B<X;B+=3)u(e.getX(B+0),e.getX(B+1),e.getX(B+2))}const T=new O,S=new O,w=new O,R=new O;function A(L){w.fromBufferAttribute(s,L),R.copy(w);const M=o[L];T.copy(M),T.sub(w.multiplyScalar(w.dot(M))).normalize(),S.crossVectors(R,M);const I=S.dot(c[L])<0?-1:1;a.setXYZW(L,T.x,T.y,T.z,I)}for(let L=0,M=E.length;L<M;++L){const y=E[L],I=y.start,N=y.count;for(let B=I,X=I+N;B<X;B+=3)A(e.getX(B+0)),A(e.getX(B+1)),A(e.getX(B+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new ln(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,p=n.count;f<p;f++)n.setXYZ(f,0,0,0);const s=new O,r=new O,a=new O,o=new O,c=new O,l=new O,d=new O,h=new O;if(e)for(let f=0,p=e.count;f<p;f+=3){const g=e.getX(f+0),_=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),a.fromBufferAttribute(t,m),d.subVectors(a,r),h.subVectors(s,r),d.cross(h),o.fromBufferAttribute(n,g),c.fromBufferAttribute(n,_),l.fromBufferAttribute(n,m),o.add(d),c.add(d),l.add(d),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(_,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let f=0,p=t.count;f<p;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),d.subVectors(a,r),h.subVectors(s,r),d.cross(h),n.setXYZ(f+0,d.x,d.y,d.z),n.setXYZ(f+1,d.x,d.y,d.z),n.setXYZ(f+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Tt.fromBufferAttribute(e,t),Tt.normalize(),e.setXYZ(t,Tt.x,Tt.y,Tt.z)}toNonIndexed(){function e(o,c){const l=o.array,d=o.itemSize,h=o.normalized,f=new l.constructor(c.length*d);let p=0,g=0;for(let _=0,m=c.length;_<m;_++){o.isInterleavedBufferAttribute?p=c[_]*o.data.stride+o.offset:p=c[_]*d;for(let u=0;u<d;u++)f[g++]=l[p++]}return new ln(f,d,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new jt,n=this.index.array,s=this.attributes;for(const o in s){const c=s[o],l=e(c,n);t.setAttribute(o,l)}const r=this.morphAttributes;for(const o in r){const c=[],l=r[o];for(let d=0,h=l.length;d<h;d++){const f=l[d],p=e(f,n);c.push(p)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const l=n[c];e.data.attributes[c]=l.toJSON(e.data)}const s={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],d=[];for(let h=0,f=l.length;h<f;h++){const p=l[h];d.push(p.toJSON(e.data))}d.length>0&&(s[c]=d,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const l in s){const d=s[l];this.setAttribute(l,d.clone(t))}const r=e.morphAttributes;for(const l in r){const d=[],h=r[l];for(let f=0,p=h.length;f<p;f++)d.push(h[f].clone(t));this.morphAttributes[l]=d}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let l=0,d=a.length;l<d;l++){const h=a[l];this.addGroup(h.start,h.count,h.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Do=new at,Xn=new Zl,bs=new Vi,Uo=new O,Ts=new O,As=new O,ws=new O,kr=new O,Rs=new O,No=new O,Cs=new O;class Ne extends _t{constructor(e=new jt,t=new Ii){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){Rs.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const d=o[c],h=r[c];d!==0&&(kr.fromBufferAttribute(h,e),a?Rs.addScaledVector(kr,d):Rs.addScaledVector(kr.sub(t),d))}t.add(Rs)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),bs.copy(n.boundingSphere),bs.applyMatrix4(r),Xn.copy(e.ray).recast(e.near),!(bs.containsPoint(Xn.origin)===!1&&(Xn.intersectSphere(bs,Uo)===null||Xn.origin.distanceToSquared(Uo)>(e.far-e.near)**2))&&(Do.copy(r).invert(),Xn.copy(e.ray).applyMatrix4(Do),!(n.boundingBox!==null&&Xn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Xn)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,d=r.attributes.uv1,h=r.attributes.normal,f=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,_=f.length;g<_;g++){const m=f[g],u=a[m.materialIndex],E=Math.max(m.start,p.start),T=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let S=E,w=T;S<w;S+=3){const R=o.getX(S),A=o.getX(S+1),L=o.getX(S+2);s=Is(this,u,e,n,l,d,h,R,A,L),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,p.start),_=Math.min(o.count,p.start+p.count);for(let m=g,u=_;m<u;m+=3){const E=o.getX(m),T=o.getX(m+1),S=o.getX(m+2);s=Is(this,a,e,n,l,d,h,E,T,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let g=0,_=f.length;g<_;g++){const m=f[g],u=a[m.materialIndex],E=Math.max(m.start,p.start),T=Math.min(c.count,Math.min(m.start+m.count,p.start+p.count));for(let S=E,w=T;S<w;S+=3){const R=S,A=S+1,L=S+2;s=Is(this,u,e,n,l,d,h,R,A,L),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,p.start),_=Math.min(c.count,p.start+p.count);for(let m=g,u=_;m<u;m+=3){const E=m,T=m+1,S=m+2;s=Is(this,a,e,n,l,d,h,E,T,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function Yd(i,e,t,n,s,r,a,o){let c;if(e.side===zt?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,e.side===Hn,o),c===null)return null;Cs.copy(o),Cs.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(Cs);return l<t.near||l>t.far?null:{distance:l,point:Cs.clone(),object:i}}function Is(i,e,t,n,s,r,a,o,c,l){i.getVertexPosition(o,Ts),i.getVertexPosition(c,As),i.getVertexPosition(l,ws);const d=Yd(i,e,t,n,Ts,As,ws,No);if(d){const h=new O;tn.getBarycoord(No,Ts,As,ws,h),s&&(d.uv=tn.getInterpolatedAttribute(s,o,c,l,h,new qe)),r&&(d.uv1=tn.getInterpolatedAttribute(r,o,c,l,h,new qe)),a&&(d.normal=tn.getInterpolatedAttribute(a,o,c,l,h,new O),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));const f={a:o,b:c,c:l,normal:new O,materialIndex:0};tn.getNormal(Ts,As,ws,f.normal),d.face=f,d.barycoord=h}return d}class Ht extends jt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const c=[],l=[],d=[],h=[];let f=0,p=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new pt(l,3)),this.setAttribute("normal",new pt(d,3)),this.setAttribute("uv",new pt(h,2));function g(_,m,u,E,T,S,w,R,A,L,M){const y=S/A,I=w/L,N=S/2,B=w/2,X=R/2,G=A+1,Y=L+1;let Z=0,$=0;const oe=new O;for(let he=0;he<Y;he++){const be=he*I-B;for(let Ge=0;Ge<G;Ge++){const it=Ge*y-N;oe[_]=it*E,oe[m]=be*T,oe[u]=X,l.push(oe.x,oe.y,oe.z),oe[_]=0,oe[m]=0,oe[u]=R>0?1:-1,d.push(oe.x,oe.y,oe.z),h.push(Ge/A),h.push(1-he/L),Z+=1}}for(let he=0;he<L;he++)for(let be=0;be<A;be++){const Ge=f+be+G*he,it=f+be+G*(he+1),ot=f+(be+1)+G*(he+1),Ze=f+(be+1)+G*he;c.push(Ge,it,Ze),c.push(it,ot,Ze),$+=6}o.addGroup(p,$,M),p+=$,f+=Z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ht(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function ki(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function Nt(i){const e={};for(let t=0;t<i.length;t++){const n=ki(i[t]);for(const s in n)e[s]=n[s]}return e}function qd(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function nc(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ke.workingColorSpace}const jd={clone:ki,merge:Nt};var Kd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Zd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class zn extends $i{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Kd,this.fragmentShader=Zd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ki(e.uniforms),this.uniformsGroups=qd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class ic extends _t{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new at,this.projectionMatrix=new at,this.projectionMatrixInverse=new at,this.coordinateSystem=pn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Un=new O,Oo=new qe,Fo=new qe;class Yt extends ic{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=tr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(js*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return tr*2*Math.atan(Math.tan(js*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Un.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Un.x,Un.y).multiplyScalar(-e/Un.z),Un.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Un.x,Un.y).multiplyScalar(-e/Un.z)}getViewSize(e,t){return this.getViewBounds(e,Oo,Fo),t.subVectors(Fo,Oo)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(js*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,t-=a.offsetY*n/l,s*=a.width/c,n*=a.height/l}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const bi=-90,Ti=1;class Jd extends _t{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Yt(bi,Ti,e,t);s.layers=this.layers,this.add(s);const r=new Yt(bi,Ti,e,t);r.layers=this.layers,this.add(r);const a=new Yt(bi,Ti,e,t);a.layers=this.layers,this.add(a);const o=new Yt(bi,Ti,e,t);o.layers=this.layers,this.add(o);const c=new Yt(bi,Ti,e,t);c.layers=this.layers,this.add(c);const l=new Yt(bi,Ti,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,c]=t;for(const l of t)this.remove(l);if(e===pn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===er)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,c,l,d]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,a),e.setRenderTarget(n,2,s),e.render(t,o),e.setRenderTarget(n,3,s),e.render(t,c),e.setRenderTarget(n,4,s),e.render(t,l),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,s),e.render(t,d),e.setRenderTarget(h,f,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class sc extends Lt{constructor(e=[],t=Oi,n,s,r,a,o,c,l,d){super(e,t,n,s,r,a,o,c,l,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Qd extends ai{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new sc(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Ht(5,5,5),r=new zn({name:"CubemapFromEquirect",uniforms:ki(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:zt,blending:Bn});r.uniforms.tEquirect.value=t;const a=new Ne(s,r),o=t.minFilter;return t.minFilter===ni&&(t.minFilter=un),new Jd(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}class en extends _t{constructor(){super(),this.isGroup=!0,this.type="Group"}}const eh={type:"move"};class Hr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new en,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new en,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new en,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,n),u=this._getHandJoint(l,_);m!==null&&(u.matrix.fromArray(m.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,u.jointRadius=m.radius),u.visible=m!==null}const d=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],f=d.position.distanceTo(h.position),p=.02,g=.005;l.inputState.pinching&&f>p+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&f<=p-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(eh)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new en;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class Za{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new ze(e),this.near=t,this.far=n}clone(){return new Za(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class th extends _t{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new gn,this.environmentIntensity=1,this.environmentRotation=new gn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class nh extends Lt{constructor(e=null,t=1,n=1,s,r,a,o,c,l=qt,d=qt,h,f){super(null,a,o,c,l,d,s,r,h,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Bo extends ln{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Ai=new at,ko=new at,Ps=[],Ho=new ci,ih=new at,Ji=new Ne,Qi=new Vi;class zo extends Ne{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Bo(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,ih)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new ci),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ai),Ho.copy(e.boundingBox).applyMatrix4(Ai),this.boundingBox.union(Ho)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Vi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ai),Qi.copy(e.boundingSphere).applyMatrix4(Ai),this.boundingSphere.union(Qi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){const n=this.matrixWorld,s=this.count;if(Ji.geometry=this.geometry,Ji.material=this.material,Ji.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Qi.copy(this.boundingSphere),Qi.applyMatrix4(n),e.ray.intersectsSphere(Qi)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ai),ko.multiplyMatrices(n,Ai),Ji.matrixWorld=ko,Ji.raycast(e,Ps);for(let a=0,o=Ps.length;a<o;a++){const c=Ps[a];c.instanceId=r,c.object=this,t.push(c)}Ps.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Bo(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new nh(new Float32Array(s*this.count),s,this.count,Xa,fn));const r=this.morphTexture.source.data.data;let a=0;for(let l=0;l<n.length;l++)a+=n[l];const o=this.geometry.morphTargetsRelative?1:1-a,c=s*e;r[c]=o,r.set(n,c+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const zr=new O,sh=new O,rh=new Be;class Kn{constructor(e=new O(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=zr.subVectors(n,t).cross(sh.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(zr),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||rh.getNormalMatrix(e),s=this.coplanarPoint(zr).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Yn=new Vi,ah=new qe(.5,.5),Ls=new O;class Ja{constructor(e=new Kn,t=new Kn,n=new Kn,s=new Kn,r=new Kn,a=new Kn){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=pn,n=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],c=r[2],l=r[3],d=r[4],h=r[5],f=r[6],p=r[7],g=r[8],_=r[9],m=r[10],u=r[11],E=r[12],T=r[13],S=r[14],w=r[15];if(s[0].setComponents(l-a,p-d,u-g,w-E).normalize(),s[1].setComponents(l+a,p+d,u+g,w+E).normalize(),s[2].setComponents(l+o,p+h,u+_,w+T).normalize(),s[3].setComponents(l-o,p-h,u-_,w-T).normalize(),n)s[4].setComponents(c,f,m,S).normalize(),s[5].setComponents(l-c,p-f,u-m,w-S).normalize();else if(s[4].setComponents(l-c,p-f,u-m,w-S).normalize(),t===pn)s[5].setComponents(l+c,p+f,u+m,w+S).normalize();else if(t===er)s[5].setComponents(c,f,m,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Yn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Yn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Yn)}intersectsSprite(e){Yn.center.set(0,0,0);const t=ah.distanceTo(e.center);return Yn.radius=.7071067811865476+t,Yn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Yn)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(Ls.x=s.normal.x>0?e.max.x:e.min.x,Ls.y=s.normal.y>0?e.max.y:e.min.y,Ls.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ls)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class rc extends $i{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ze(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const ir=new O,sr=new O,Go=new at,es=new Zl,Ds=new Vi,Gr=new O,Vo=new O;class oh extends _t{constructor(e=new jt,t=new rc){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)ir.fromBufferAttribute(t,s-1),sr.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=ir.distanceTo(sr);e.setAttribute("lineDistance",new pt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ds.copy(n.boundingSphere),Ds.applyMatrix4(s),Ds.radius+=r,e.ray.intersectsSphere(Ds)===!1)return;Go.copy(s).invert(),es.copy(e.ray).applyMatrix4(Go);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,d=n.index,f=n.attributes.position;if(d!==null){const p=Math.max(0,a.start),g=Math.min(d.count,a.start+a.count);for(let _=p,m=g-1;_<m;_+=l){const u=d.getX(_),E=d.getX(_+1),T=Us(this,e,es,c,u,E,_);T&&t.push(T)}if(this.isLineLoop){const _=d.getX(g-1),m=d.getX(p),u=Us(this,e,es,c,_,m,g-1);u&&t.push(u)}}else{const p=Math.max(0,a.start),g=Math.min(f.count,a.start+a.count);for(let _=p,m=g-1;_<m;_+=l){const u=Us(this,e,es,c,_,_+1,_);u&&t.push(u)}if(this.isLineLoop){const _=Us(this,e,es,c,g-1,p,g-1);_&&t.push(_)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Us(i,e,t,n,s,r,a){const o=i.geometry.attributes.position;if(ir.fromBufferAttribute(o,s),sr.fromBufferAttribute(o,r),t.distanceSqToSegment(ir,sr,Gr,Vo)>n)return;Gr.applyMatrix4(i.matrixWorld);const l=e.ray.origin.distanceTo(Gr);if(!(l<e.near||l>e.far))return{distance:l,point:Vo.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}const $o=new O,Wo=new O;class lh extends oh{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)$o.fromBufferAttribute(t,s),Wo.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+$o.distanceTo(Wo);e.setAttribute("lineDistance",new pt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class ch extends Lt{constructor(e,t,n,s,r,a,o,c,l){super(e,t,n,s,r,a,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}class ac extends Lt{constructor(e,t,n=ri,s,r,a,o=qt,c=qt,l,d=ss,h=1){if(d!==ss&&d!==rs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const f={width:e,height:t,depth:h};super(f,s,r,a,o,c,d,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ka(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class oc extends Lt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Qn extends jt{constructor(e=1,t=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:n,radialSegments:s,heightSegments:r},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));const a=[],o=[],c=[],l=[],d=t/2,h=Math.PI/2*e,f=t,p=2*h+f,g=n*2+r,_=s+1,m=new O,u=new O;for(let E=0;E<=g;E++){let T=0,S=0,w=0,R=0;if(E<=n){const M=E/n,y=M*Math.PI/2;S=-d-e*Math.cos(y),w=e*Math.sin(y),R=-e*Math.cos(y),T=M*h}else if(E<=n+r){const M=(E-n)/r;S=-d+M*t,w=e,R=0,T=h+M*f}else{const M=(E-n-r)/n,y=M*Math.PI/2;S=d+e*Math.sin(y),w=e*Math.cos(y),R=e*Math.sin(y),T=h+f+M*h}const A=Math.max(0,Math.min(1,T/p));let L=0;E===0?L=.5/s:E===g&&(L=-.5/s);for(let M=0;M<=s;M++){const y=M/s,I=y*Math.PI*2,N=Math.sin(I),B=Math.cos(I);u.x=-w*B,u.y=S,u.z=w*N,o.push(u.x,u.y,u.z),m.set(-w*B,R,w*N),m.normalize(),c.push(m.x,m.y,m.z),l.push(y+L,A)}if(E>0){const M=(E-1)*_;for(let y=0;y<s;y++){const I=M+y,N=M+y+1,B=E*_+y,X=E*_+y+1;a.push(I,N,B),a.push(N,X,B)}}}this.setIndex(a),this.setAttribute("position",new pt(o,3)),this.setAttribute("normal",new pt(c,3)),this.setAttribute("uv",new pt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Qn(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}}class Nn extends jt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};const l=this;s=Math.floor(s),r=Math.floor(r);const d=[],h=[],f=[],p=[];let g=0;const _=[],m=n/2;let u=0;E(),a===!1&&(e>0&&T(!0),t>0&&T(!1)),this.setIndex(d),this.setAttribute("position",new pt(h,3)),this.setAttribute("normal",new pt(f,3)),this.setAttribute("uv",new pt(p,2));function E(){const S=new O,w=new O;let R=0;const A=(t-e)/n;for(let L=0;L<=r;L++){const M=[],y=L/r,I=y*(t-e)+e;for(let N=0;N<=s;N++){const B=N/s,X=B*c+o,G=Math.sin(X),Y=Math.cos(X);w.x=I*G,w.y=-y*n+m,w.z=I*Y,h.push(w.x,w.y,w.z),S.set(G,A,Y).normalize(),f.push(S.x,S.y,S.z),p.push(B,1-y),M.push(g++)}_.push(M)}for(let L=0;L<s;L++)for(let M=0;M<r;M++){const y=_[M][L],I=_[M+1][L],N=_[M+1][L+1],B=_[M][L+1];(e>0||M!==0)&&(d.push(y,I,B),R+=3),(t>0||M!==r-1)&&(d.push(I,N,B),R+=3)}l.addGroup(u,R,0),u+=R}function T(S){const w=g,R=new qe,A=new O;let L=0;const M=S===!0?e:t,y=S===!0?1:-1;for(let N=1;N<=s;N++)h.push(0,m*y,0),f.push(0,y,0),p.push(.5,.5),g++;const I=g;for(let N=0;N<=s;N++){const X=N/s*c+o,G=Math.cos(X),Y=Math.sin(X);A.x=M*Y,A.y=m*y,A.z=M*G,h.push(A.x,A.y,A.z),f.push(0,y,0),R.x=G*.5+.5,R.y=Y*.5*y+.5,p.push(R.x,R.y),g++}for(let N=0;N<s;N++){const B=w+N,X=I+N;S===!0?d.push(X,X+1,B):d.push(X+1,X,B),L+=3}l.addGroup(u,L,S===!0?1:2),u+=L}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Nn(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}const Ns=new O,Os=new O,Vr=new O,Fs=new tn;class dh extends jt{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){const s=Math.pow(10,4),r=Math.cos(js*t),a=e.getIndex(),o=e.getAttribute("position"),c=a?a.count:o.count,l=[0,0,0],d=["a","b","c"],h=new Array(3),f={},p=[];for(let g=0;g<c;g+=3){a?(l[0]=a.getX(g),l[1]=a.getX(g+1),l[2]=a.getX(g+2)):(l[0]=g,l[1]=g+1,l[2]=g+2);const{a:_,b:m,c:u}=Fs;if(_.fromBufferAttribute(o,l[0]),m.fromBufferAttribute(o,l[1]),u.fromBufferAttribute(o,l[2]),Fs.getNormal(Vr),h[0]=`${Math.round(_.x*s)},${Math.round(_.y*s)},${Math.round(_.z*s)}`,h[1]=`${Math.round(m.x*s)},${Math.round(m.y*s)},${Math.round(m.z*s)}`,h[2]=`${Math.round(u.x*s)},${Math.round(u.y*s)},${Math.round(u.z*s)}`,!(h[0]===h[1]||h[1]===h[2]||h[2]===h[0]))for(let E=0;E<3;E++){const T=(E+1)%3,S=h[E],w=h[T],R=Fs[d[E]],A=Fs[d[T]],L=`${S}_${w}`,M=`${w}_${S}`;M in f&&f[M]?(Vr.dot(f[M].normal)<=r&&(p.push(R.x,R.y,R.z),p.push(A.x,A.y,A.z)),f[M]=null):L in f||(f[L]={index0:l[E],index1:l[T],normal:Vr.clone()})}}for(const g in f)if(f[g]){const{index0:_,index1:m}=f[g];Ns.fromBufferAttribute(o,_),Os.fromBufferAttribute(o,m),p.push(Ns.x,Ns.y,Ns.z),p.push(Os.x,Os.y,Os.z)}this.setAttribute("position",new pt(p,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}class si extends jt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),c=Math.floor(s),l=o+1,d=c+1,h=e/o,f=t/c,p=[],g=[],_=[],m=[];for(let u=0;u<d;u++){const E=u*f-a;for(let T=0;T<l;T++){const S=T*h-r;g.push(S,-E,0),_.push(0,0,1),m.push(T/o),m.push(1-u/c)}}for(let u=0;u<c;u++)for(let E=0;E<o;E++){const T=E+l*u,S=E+l*(u+1),w=E+1+l*(u+1),R=E+1+l*u;p.push(T,S,R),p.push(S,w,R)}this.setIndex(p),this.setAttribute("position",new pt(g,3)),this.setAttribute("normal",new pt(_,3)),this.setAttribute("uv",new pt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new si(e.width,e.height,e.widthSegments,e.heightSegments)}}class An extends jt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const c=Math.min(a+o,Math.PI);let l=0;const d=[],h=new O,f=new O,p=[],g=[],_=[],m=[];for(let u=0;u<=n;u++){const E=[],T=u/n;let S=0;u===0&&a===0?S=.5/t:u===n&&c===Math.PI&&(S=-.5/t);for(let w=0;w<=t;w++){const R=w/t;h.x=-e*Math.cos(s+R*r)*Math.sin(a+T*o),h.y=e*Math.cos(a+T*o),h.z=e*Math.sin(s+R*r)*Math.sin(a+T*o),g.push(h.x,h.y,h.z),f.copy(h).normalize(),_.push(f.x,f.y,f.z),m.push(R+S,1-T),E.push(l++)}d.push(E)}for(let u=0;u<n;u++)for(let E=0;E<t;E++){const T=d[u][E+1],S=d[u][E],w=d[u+1][E],R=d[u+1][E+1];(u!==0||a>0)&&p.push(T,S,R),(u!==n-1||c<Math.PI)&&p.push(S,w,R)}this.setIndex(p),this.setAttribute("position",new pt(g,3)),this.setAttribute("normal",new pt(_,3)),this.setAttribute("uv",new pt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new An(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Pi extends jt{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);const a=[],o=[],c=[],l=[],d=new O,h=new O,f=new O;for(let p=0;p<=n;p++)for(let g=0;g<=s;g++){const _=g/s*r,m=p/n*Math.PI*2;h.x=(e+t*Math.cos(m))*Math.cos(_),h.y=(e+t*Math.cos(m))*Math.sin(_),h.z=t*Math.sin(m),o.push(h.x,h.y,h.z),d.x=e*Math.cos(_),d.y=e*Math.sin(_),f.subVectors(h,d).normalize(),c.push(f.x,f.y,f.z),l.push(g/s),l.push(p/n)}for(let p=1;p<=n;p++)for(let g=1;g<=s;g++){const _=(s+1)*p+g-1,m=(s+1)*(p-1)+g-1,u=(s+1)*(p-1)+g,E=(s+1)*p+g;a.push(_,m,E),a.push(m,u,E)}this.setIndex(a),this.setAttribute("position",new pt(o,3)),this.setAttribute("normal",new pt(c,3)),this.setAttribute("uv",new pt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Pi(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class wt extends $i{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new ze(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ze(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Yl,this.normalScale=new qe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class hh extends wt{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new qe(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return We(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new ze(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new ze(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new ze(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class uh extends $i{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=vd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class fh extends $i{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Qa extends _t{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ze(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class ph extends Qa{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(_t.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ze(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const $r=new at,Xo=new O,Yo=new O;class lc{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new qe(512,512),this.mapType=mn,this.map=null,this.mapPass=null,this.matrix=new at,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ja,this._frameExtents=new qe(1,1),this._viewportCount=1,this._viewports=[new ft(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Xo.setFromMatrixPosition(e.matrixWorld),t.position.copy(Xo),Yo.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Yo),t.updateMatrixWorld(),$r.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix($r,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply($r)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class mh extends lc{constructor(){super(new Yt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=tr*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class gh extends Qa{constructor(e,t,n=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(_t.DEFAULT_UP),this.updateMatrix(),this.target=new _t,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new mh}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class cc extends ic{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,c=s-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=d*this.view.offsetY,c=o-d*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class _h extends lc{constructor(){super(new cc(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class vh extends Qa{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(_t.DEFAULT_UP),this.updateMatrix(),this.target=new _t,this.shadow=new _h}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class xh extends Yt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}function qo(i,e,t,n){const s=Mh(n);switch(t){case $l:return i*e;case Xa:return i*e/s.components*s.byteLength;case Ya:return i*e/s.components*s.byteLength;case Xl:return i*e*2/s.components*s.byteLength;case qa:return i*e*2/s.components*s.byteLength;case Wl:return i*e*3/s.components*s.byteLength;case on:return i*e*4/s.components*s.byteLength;case ja:return i*e*4/s.components*s.byteLength;case Ws:case Xs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ys:case qs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ua:case pa:return Math.max(i,16)*Math.max(e,8)/4;case ha:case fa:return Math.max(i,8)*Math.max(e,8)/2;case ma:case ga:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case _a:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case va:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case xa:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Ma:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case ya:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Sa:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Ea:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case ba:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Ta:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Aa:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case wa:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Ra:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Ca:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Ia:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Pa:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case La:case Da:case Ua:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Na:case Oa:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Fa:case Ba:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Mh(i){switch(i){case mn:case Hl:return{byteLength:1,components:1};case ns:case zl:case ls:return{byteLength:2,components:1};case $a:case Wa:return{byteLength:2,components:4};case ri:case Va:case fn:return{byteLength:4,components:1};case Gl:case Vl:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ga}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ga);function dc(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function yh(i){const e=new WeakMap;function t(o,c){const l=o.array,d=o.usage,h=l.byteLength,f=i.createBuffer();i.bindBuffer(c,f),i.bufferData(c,l,d),o.onUploadCallback();let p;if(l instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)p=i.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)p=i.SHORT;else if(l instanceof Uint32Array)p=i.UNSIGNED_INT;else if(l instanceof Int32Array)p=i.INT;else if(l instanceof Int8Array)p=i.BYTE;else if(l instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:p,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:h}}function n(o,c,l){const d=c.array,h=c.updateRanges;if(i.bindBuffer(l,o),h.length===0)i.bufferSubData(l,0,d);else{h.sort((p,g)=>p.start-g.start);let f=0;for(let p=1;p<h.length;p++){const g=h[f],_=h[p];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++f,h[f]=_)}h.length=f+1;for(let p=0,g=h.length;p<g;p++){const _=h[p];i.bufferSubData(l,_.start*d.BYTES_PER_ELEMENT,d,_.start,_.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const c=e.get(o);c&&(i.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const d=e.get(o);(!d||d.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,o,c),l.version=o.version}}return{get:s,remove:r,update:a}}var Sh=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Eh=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,bh=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Th=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ah=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,wh=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Rh=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Ch=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Ih=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Ph=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Lh=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Dh=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Uh=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Nh=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Oh=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Fh=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Bh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,kh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Hh=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,zh=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Gh=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Vh=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,$h=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Wh=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Xh=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Yh=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,qh=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,jh=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Kh=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Zh=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Jh="gl_FragColor = linearToOutputTexel( gl_FragColor );",Qh=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,eu=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,tu=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,nu=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,iu=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,su=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ru=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,au=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ou=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,lu=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,cu=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,du=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,hu=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,uu=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,fu=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,pu=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,mu=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,gu=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,_u=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,vu=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,xu=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Mu=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,yu=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Su=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Eu=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,bu=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Tu=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Au=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,wu=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ru=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Cu=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Iu=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Pu=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Lu=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Du=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Uu=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Nu=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Ou=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fu=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Bu=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ku=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Hu=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,zu=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Gu=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Vu=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,$u=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Wu=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Xu=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Yu=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,qu=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,ju=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Ku=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Zu=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Ju=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Qu=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,ef=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,tf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,nf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,sf=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,rf=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,af=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,of=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,lf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,cf=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,df=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,hf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,uf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,ff=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,pf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,mf=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,gf=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,_f=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,vf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,xf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Mf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,yf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Sf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Ef=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,bf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Tf=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Af=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,wf=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Rf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Cf=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,If=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Pf=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Lf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Df=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Uf=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Nf=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Of=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Ff=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Bf=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,kf=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Hf=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,zf=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Gf=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Vf=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,$f=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Wf=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Xf=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Yf=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qf=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,jf=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Kf=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Zf=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Jf=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Qf=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ep=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,tp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,He={alphahash_fragment:Sh,alphahash_pars_fragment:Eh,alphamap_fragment:bh,alphamap_pars_fragment:Th,alphatest_fragment:Ah,alphatest_pars_fragment:wh,aomap_fragment:Rh,aomap_pars_fragment:Ch,batching_pars_vertex:Ih,batching_vertex:Ph,begin_vertex:Lh,beginnormal_vertex:Dh,bsdfs:Uh,iridescence_fragment:Nh,bumpmap_pars_fragment:Oh,clipping_planes_fragment:Fh,clipping_planes_pars_fragment:Bh,clipping_planes_pars_vertex:kh,clipping_planes_vertex:Hh,color_fragment:zh,color_pars_fragment:Gh,color_pars_vertex:Vh,color_vertex:$h,common:Wh,cube_uv_reflection_fragment:Xh,defaultnormal_vertex:Yh,displacementmap_pars_vertex:qh,displacementmap_vertex:jh,emissivemap_fragment:Kh,emissivemap_pars_fragment:Zh,colorspace_fragment:Jh,colorspace_pars_fragment:Qh,envmap_fragment:eu,envmap_common_pars_fragment:tu,envmap_pars_fragment:nu,envmap_pars_vertex:iu,envmap_physical_pars_fragment:pu,envmap_vertex:su,fog_vertex:ru,fog_pars_vertex:au,fog_fragment:ou,fog_pars_fragment:lu,gradientmap_pars_fragment:cu,lightmap_pars_fragment:du,lights_lambert_fragment:hu,lights_lambert_pars_fragment:uu,lights_pars_begin:fu,lights_toon_fragment:mu,lights_toon_pars_fragment:gu,lights_phong_fragment:_u,lights_phong_pars_fragment:vu,lights_physical_fragment:xu,lights_physical_pars_fragment:Mu,lights_fragment_begin:yu,lights_fragment_maps:Su,lights_fragment_end:Eu,logdepthbuf_fragment:bu,logdepthbuf_pars_fragment:Tu,logdepthbuf_pars_vertex:Au,logdepthbuf_vertex:wu,map_fragment:Ru,map_pars_fragment:Cu,map_particle_fragment:Iu,map_particle_pars_fragment:Pu,metalnessmap_fragment:Lu,metalnessmap_pars_fragment:Du,morphinstance_vertex:Uu,morphcolor_vertex:Nu,morphnormal_vertex:Ou,morphtarget_pars_vertex:Fu,morphtarget_vertex:Bu,normal_fragment_begin:ku,normal_fragment_maps:Hu,normal_pars_fragment:zu,normal_pars_vertex:Gu,normal_vertex:Vu,normalmap_pars_fragment:$u,clearcoat_normal_fragment_begin:Wu,clearcoat_normal_fragment_maps:Xu,clearcoat_pars_fragment:Yu,iridescence_pars_fragment:qu,opaque_fragment:ju,packing:Ku,premultiplied_alpha_fragment:Zu,project_vertex:Ju,dithering_fragment:Qu,dithering_pars_fragment:ef,roughnessmap_fragment:tf,roughnessmap_pars_fragment:nf,shadowmap_pars_fragment:sf,shadowmap_pars_vertex:rf,shadowmap_vertex:af,shadowmask_pars_fragment:of,skinbase_vertex:lf,skinning_pars_vertex:cf,skinning_vertex:df,skinnormal_vertex:hf,specularmap_fragment:uf,specularmap_pars_fragment:ff,tonemapping_fragment:pf,tonemapping_pars_fragment:mf,transmission_fragment:gf,transmission_pars_fragment:_f,uv_pars_fragment:vf,uv_pars_vertex:xf,uv_vertex:Mf,worldpos_vertex:yf,background_vert:Sf,background_frag:Ef,backgroundCube_vert:bf,backgroundCube_frag:Tf,cube_vert:Af,cube_frag:wf,depth_vert:Rf,depth_frag:Cf,distanceRGBA_vert:If,distanceRGBA_frag:Pf,equirect_vert:Lf,equirect_frag:Df,linedashed_vert:Uf,linedashed_frag:Nf,meshbasic_vert:Of,meshbasic_frag:Ff,meshlambert_vert:Bf,meshlambert_frag:kf,meshmatcap_vert:Hf,meshmatcap_frag:zf,meshnormal_vert:Gf,meshnormal_frag:Vf,meshphong_vert:$f,meshphong_frag:Wf,meshphysical_vert:Xf,meshphysical_frag:Yf,meshtoon_vert:qf,meshtoon_frag:jf,points_vert:Kf,points_frag:Zf,shadow_vert:Jf,shadow_frag:Qf,sprite_vert:ep,sprite_frag:tp},ae={common:{diffuse:{value:new ze(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Be}},envmap:{envMap:{value:null},envMapRotation:{value:new Be},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Be}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Be}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Be},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Be},normalScale:{value:new qe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Be},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Be}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Be}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Be}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ze(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ze(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0},uvTransform:{value:new Be}},sprite:{diffuse:{value:new ze(16777215)},opacity:{value:1},center:{value:new qe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}}},dn={basic:{uniforms:Nt([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.fog]),vertexShader:He.meshbasic_vert,fragmentShader:He.meshbasic_frag},lambert:{uniforms:Nt([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,ae.lights,{emissive:{value:new ze(0)}}]),vertexShader:He.meshlambert_vert,fragmentShader:He.meshlambert_frag},phong:{uniforms:Nt([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,ae.lights,{emissive:{value:new ze(0)},specular:{value:new ze(1118481)},shininess:{value:30}}]),vertexShader:He.meshphong_vert,fragmentShader:He.meshphong_frag},standard:{uniforms:Nt([ae.common,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.roughnessmap,ae.metalnessmap,ae.fog,ae.lights,{emissive:{value:new ze(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag},toon:{uniforms:Nt([ae.common,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.gradientmap,ae.fog,ae.lights,{emissive:{value:new ze(0)}}]),vertexShader:He.meshtoon_vert,fragmentShader:He.meshtoon_frag},matcap:{uniforms:Nt([ae.common,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,{matcap:{value:null}}]),vertexShader:He.meshmatcap_vert,fragmentShader:He.meshmatcap_frag},points:{uniforms:Nt([ae.points,ae.fog]),vertexShader:He.points_vert,fragmentShader:He.points_frag},dashed:{uniforms:Nt([ae.common,ae.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:He.linedashed_vert,fragmentShader:He.linedashed_frag},depth:{uniforms:Nt([ae.common,ae.displacementmap]),vertexShader:He.depth_vert,fragmentShader:He.depth_frag},normal:{uniforms:Nt([ae.common,ae.bumpmap,ae.normalmap,ae.displacementmap,{opacity:{value:1}}]),vertexShader:He.meshnormal_vert,fragmentShader:He.meshnormal_frag},sprite:{uniforms:Nt([ae.sprite,ae.fog]),vertexShader:He.sprite_vert,fragmentShader:He.sprite_frag},background:{uniforms:{uvTransform:{value:new Be},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:He.background_vert,fragmentShader:He.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Be}},vertexShader:He.backgroundCube_vert,fragmentShader:He.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:He.cube_vert,fragmentShader:He.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:He.equirect_vert,fragmentShader:He.equirect_frag},distanceRGBA:{uniforms:Nt([ae.common,ae.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:He.distanceRGBA_vert,fragmentShader:He.distanceRGBA_frag},shadow:{uniforms:Nt([ae.lights,ae.fog,{color:{value:new ze(0)},opacity:{value:1}}]),vertexShader:He.shadow_vert,fragmentShader:He.shadow_frag}};dn.physical={uniforms:Nt([dn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Be},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Be},clearcoatNormalScale:{value:new qe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Be},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Be},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Be},sheen:{value:0},sheenColor:{value:new ze(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Be},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Be},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Be},transmissionSamplerSize:{value:new qe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Be},attenuationDistance:{value:0},attenuationColor:{value:new ze(0)},specularColor:{value:new ze(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Be},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Be},anisotropyVector:{value:new qe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Be}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag};const Bs={r:0,b:0,g:0},qn=new gn,np=new at;function ip(i,e,t,n,s,r,a){const o=new ze(0);let c=r===!0?0:1,l,d,h=null,f=0,p=null;function g(T){let S=T.isScene===!0?T.background:null;return S&&S.isTexture&&(S=(T.backgroundBlurriness>0?t:e).get(S)),S}function _(T){let S=!1;const w=g(T);w===null?u(o,c):w&&w.isColor&&(u(w,1),S=!0);const R=i.xr.getEnvironmentBlendMode();R==="additive"?n.buffers.color.setClear(0,0,0,1,a):R==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||S)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(T,S){const w=g(S);w&&(w.isCubeTexture||w.mapping===lr)?(d===void 0&&(d=new Ne(new Ht(1,1,1),new zn({name:"BackgroundCubeMaterial",uniforms:ki(dn.backgroundCube.uniforms),vertexShader:dn.backgroundCube.vertexShader,fragmentShader:dn.backgroundCube.fragmentShader,side:zt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),d.geometry.deleteAttribute("normal"),d.geometry.deleteAttribute("uv"),d.onBeforeRender=function(R,A,L){this.matrixWorld.copyPosition(L.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(d)),qn.copy(S.backgroundRotation),qn.x*=-1,qn.y*=-1,qn.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(qn.y*=-1,qn.z*=-1),d.material.uniforms.envMap.value=w,d.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,d.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,d.material.uniforms.backgroundRotation.value.setFromMatrix4(np.makeRotationFromEuler(qn)),d.material.toneMapped=Ke.getTransfer(w.colorSpace)!==et,(h!==w||f!==w.version||p!==i.toneMapping)&&(d.material.needsUpdate=!0,h=w,f=w.version,p=i.toneMapping),d.layers.enableAll(),T.unshift(d,d.geometry,d.material,0,0,null)):w&&w.isTexture&&(l===void 0&&(l=new Ne(new si(2,2),new zn({name:"BackgroundMaterial",uniforms:ki(dn.background.uniforms),vertexShader:dn.background.vertexShader,fragmentShader:dn.background.fragmentShader,side:Hn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(l)),l.material.uniforms.t2D.value=w,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=Ke.getTransfer(w.colorSpace)!==et,w.matrixAutoUpdate===!0&&w.updateMatrix(),l.material.uniforms.uvTransform.value.copy(w.matrix),(h!==w||f!==w.version||p!==i.toneMapping)&&(l.material.needsUpdate=!0,h=w,f=w.version,p=i.toneMapping),l.layers.enableAll(),T.unshift(l,l.geometry,l.material,0,0,null))}function u(T,S){T.getRGB(Bs,nc(i)),n.buffers.color.setClear(Bs.r,Bs.g,Bs.b,S,a)}function E(){d!==void 0&&(d.geometry.dispose(),d.material.dispose(),d=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(T,S=1){o.set(T),c=S,u(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(T){c=T,u(o,c)},render:_,addToRenderList:m,dispose:E}}function sp(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null);let r=s,a=!1;function o(y,I,N,B,X){let G=!1;const Y=h(B,N,I);r!==Y&&(r=Y,l(r.object)),G=p(y,B,N,X),G&&g(y,B,N,X),X!==null&&e.update(X,i.ELEMENT_ARRAY_BUFFER),(G||a)&&(a=!1,S(y,I,N,B),X!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(X).buffer))}function c(){return i.createVertexArray()}function l(y){return i.bindVertexArray(y)}function d(y){return i.deleteVertexArray(y)}function h(y,I,N){const B=N.wireframe===!0;let X=n[y.id];X===void 0&&(X={},n[y.id]=X);let G=X[I.id];G===void 0&&(G={},X[I.id]=G);let Y=G[B];return Y===void 0&&(Y=f(c()),G[B]=Y),Y}function f(y){const I=[],N=[],B=[];for(let X=0;X<t;X++)I[X]=0,N[X]=0,B[X]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:N,attributeDivisors:B,object:y,attributes:{},index:null}}function p(y,I,N,B){const X=r.attributes,G=I.attributes;let Y=0;const Z=N.getAttributes();for(const $ in Z)if(Z[$].location>=0){const he=X[$];let be=G[$];if(be===void 0&&($==="instanceMatrix"&&y.instanceMatrix&&(be=y.instanceMatrix),$==="instanceColor"&&y.instanceColor&&(be=y.instanceColor)),he===void 0||he.attribute!==be||be&&he.data!==be.data)return!0;Y++}return r.attributesNum!==Y||r.index!==B}function g(y,I,N,B){const X={},G=I.attributes;let Y=0;const Z=N.getAttributes();for(const $ in Z)if(Z[$].location>=0){let he=G[$];he===void 0&&($==="instanceMatrix"&&y.instanceMatrix&&(he=y.instanceMatrix),$==="instanceColor"&&y.instanceColor&&(he=y.instanceColor));const be={};be.attribute=he,he&&he.data&&(be.data=he.data),X[$]=be,Y++}r.attributes=X,r.attributesNum=Y,r.index=B}function _(){const y=r.newAttributes;for(let I=0,N=y.length;I<N;I++)y[I]=0}function m(y){u(y,0)}function u(y,I){const N=r.newAttributes,B=r.enabledAttributes,X=r.attributeDivisors;N[y]=1,B[y]===0&&(i.enableVertexAttribArray(y),B[y]=1),X[y]!==I&&(i.vertexAttribDivisor(y,I),X[y]=I)}function E(){const y=r.newAttributes,I=r.enabledAttributes;for(let N=0,B=I.length;N<B;N++)I[N]!==y[N]&&(i.disableVertexAttribArray(N),I[N]=0)}function T(y,I,N,B,X,G,Y){Y===!0?i.vertexAttribIPointer(y,I,N,X,G):i.vertexAttribPointer(y,I,N,B,X,G)}function S(y,I,N,B){_();const X=B.attributes,G=N.getAttributes(),Y=I.defaultAttributeValues;for(const Z in G){const $=G[Z];if($.location>=0){let oe=X[Z];if(oe===void 0&&(Z==="instanceMatrix"&&y.instanceMatrix&&(oe=y.instanceMatrix),Z==="instanceColor"&&y.instanceColor&&(oe=y.instanceColor)),oe!==void 0){const he=oe.normalized,be=oe.itemSize,Ge=e.get(oe);if(Ge===void 0)continue;const it=Ge.buffer,ot=Ge.type,Ze=Ge.bytesPerElement,j=ot===i.INT||ot===i.UNSIGNED_INT||oe.gpuType===Va;if(oe.isInterleavedBufferAttribute){const Q=oe.data,pe=Q.stride,De=oe.offset;if(Q.isInstancedInterleavedBuffer){for(let Ee=0;Ee<$.locationSize;Ee++)u($.location+Ee,Q.meshPerAttribute);y.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let Ee=0;Ee<$.locationSize;Ee++)m($.location+Ee);i.bindBuffer(i.ARRAY_BUFFER,it);for(let Ee=0;Ee<$.locationSize;Ee++)T($.location+Ee,be/$.locationSize,ot,he,pe*Ze,(De+be/$.locationSize*Ee)*Ze,j)}else{if(oe.isInstancedBufferAttribute){for(let Q=0;Q<$.locationSize;Q++)u($.location+Q,oe.meshPerAttribute);y.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let Q=0;Q<$.locationSize;Q++)m($.location+Q);i.bindBuffer(i.ARRAY_BUFFER,it);for(let Q=0;Q<$.locationSize;Q++)T($.location+Q,be/$.locationSize,ot,he,be*Ze,be/$.locationSize*Q*Ze,j)}}else if(Y!==void 0){const he=Y[Z];if(he!==void 0)switch(he.length){case 2:i.vertexAttrib2fv($.location,he);break;case 3:i.vertexAttrib3fv($.location,he);break;case 4:i.vertexAttrib4fv($.location,he);break;default:i.vertexAttrib1fv($.location,he)}}}}E()}function w(){L();for(const y in n){const I=n[y];for(const N in I){const B=I[N];for(const X in B)d(B[X].object),delete B[X];delete I[N]}delete n[y]}}function R(y){if(n[y.id]===void 0)return;const I=n[y.id];for(const N in I){const B=I[N];for(const X in B)d(B[X].object),delete B[X];delete I[N]}delete n[y.id]}function A(y){for(const I in n){const N=n[I];if(N[y.id]===void 0)continue;const B=N[y.id];for(const X in B)d(B[X].object),delete B[X];delete N[y.id]}}function L(){M(),a=!0,r!==s&&(r=s,l(r.object))}function M(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:L,resetDefaultState:M,dispose:w,releaseStatesOfGeometry:R,releaseStatesOfProgram:A,initAttributes:_,enableAttribute:m,disableUnusedAttributes:E}}function rp(i,e,t){let n;function s(l){n=l}function r(l,d){i.drawArrays(n,l,d),t.update(d,n,1)}function a(l,d,h){h!==0&&(i.drawArraysInstanced(n,l,d,h),t.update(d,n,h))}function o(l,d,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,d,0,h);let p=0;for(let g=0;g<h;g++)p+=d[g];t.update(p,n,1)}function c(l,d,h,f){if(h===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<l.length;g++)a(l[g],d[g],f[g]);else{p.multiDrawArraysInstancedWEBGL(n,l,0,d,0,f,0,h);let g=0;for(let _=0;_<h;_++)g+=d[_]*f[_];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=c}function ap(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(A){return!(A!==on&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const L=A===ls&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==mn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==fn&&!L)}function c(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const d=c(l);d!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",d,"instead."),l=d);const h=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),u=i.getParameter(i.MAX_VERTEX_ATTRIBS),E=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),T=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),w=g>0,R=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:h,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:u,maxVertexUniforms:E,maxVaryings:T,maxFragmentUniforms:S,vertexTextures:w,maxSamples:R}}function op(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new Kn,o=new Be,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){const p=h.length!==0||f||n!==0||s;return s=f,n=h.length,p},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,f){t=d(h,f,0)},this.setState=function(h,f,p){const g=h.clippingPlanes,_=h.clipIntersection,m=h.clipShadows,u=i.get(h);if(!s||g===null||g.length===0||r&&!m)r?d(null):l();else{const E=r?0:n,T=E*4;let S=u.clippingState||null;c.value=S,S=d(g,f,T,p);for(let w=0;w!==T;++w)S[w]=t[w];u.clippingState=S,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=E}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function d(h,f,p,g){const _=h!==null?h.length:0;let m=null;if(_!==0){if(m=c.value,g!==!0||m===null){const u=p+_*4,E=f.matrixWorldInverse;o.getNormalMatrix(E),(m===null||m.length<u)&&(m=new Float32Array(u));for(let T=0,S=p;T!==_;++T,S+=4)a.copy(h[T]).applyMatrix4(E,o),a.normal.toArray(m,S),m[S+3]=a.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function lp(i){let e=new WeakMap;function t(a,o){return o===oa?a.mapping=Oi:o===la&&(a.mapping=Fi),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===oa||o===la)if(e.has(a)){const c=e.get(a).texture;return t(c,a.mapping)}else{const c=a.image;if(c&&c.height>0){const l=new Qd(c.height);return l.fromEquirectangularTexture(i,a),e.set(a,l),a.addEventListener("dispose",s),t(l.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const c=e.get(o);c!==void 0&&(e.delete(o),c.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}const Li=4,jo=[.125,.215,.35,.446,.526,.582],ei=20,Wr=new cc,Ko=new ze;let Xr=null,Yr=0,qr=0,jr=!1;const Zn=(1+Math.sqrt(5))/2,wi=1/Zn,Zo=[new O(-Zn,wi,0),new O(Zn,wi,0),new O(-wi,0,Zn),new O(wi,0,Zn),new O(0,Zn,-wi),new O(0,Zn,wi),new O(-1,1,-1),new O(1,1,-1),new O(-1,1,1),new O(1,1,1)],cp=new O;class Jo{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100,r={}){const{size:a=256,position:o=cp}=r;Xr=this._renderer.getRenderTarget(),Yr=this._renderer.getActiveCubeFace(),qr=this._renderer.getActiveMipmapLevel(),jr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,s,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=tl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=el(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Xr,Yr,qr),this._renderer.xr.enabled=jr,e.scissorTest=!1,ks(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Oi||e.mapping===Fi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Xr=this._renderer.getRenderTarget(),Yr=this._renderer.getActiveCubeFace(),qr=this._renderer.getActiveMipmapLevel(),jr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:un,minFilter:un,generateMipmaps:!1,type:ls,format:on,colorSpace:Bi,depthBuffer:!1},s=Qo(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Qo(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=dp(r)),this._blurMaterial=hp(r,e,t)}return s}_compileMaterial(e){const t=new Ne(this._lodPlanes[0],e);this._renderer.compile(t,Wr)}_sceneToCubeUV(e,t,n,s,r){const c=new Yt(90,1,t,n),l=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,p=h.toneMapping;h.getClearColor(Ko),h.toneMapping=kn,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null));const _=new Ii({name:"PMREM.Background",side:zt,depthWrite:!1,depthTest:!1}),m=new Ne(new Ht,_);let u=!1;const E=e.background;E?E.isColor&&(_.color.copy(E),e.background=null,u=!0):(_.color.copy(Ko),u=!0);for(let T=0;T<6;T++){const S=T%3;S===0?(c.up.set(0,l[T],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+d[T],r.y,r.z)):S===1?(c.up.set(0,0,l[T]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+d[T],r.z)):(c.up.set(0,l[T],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+d[T]));const w=this._cubeSize;ks(s,S*w,T>2?w:0,w,w),h.setRenderTarget(s),u&&h.render(m,c),h.render(e,c)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=p,h.autoClear=f,e.background=E}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===Oi||e.mapping===Fi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=tl()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=el());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new Ne(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;const c=this._cubeSize;ks(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,Wr)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Zo[(s-r-1)%Zo.length];this._blur(e,r-1,r,a,o)}t.autoClear=n}_blur(e,t,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){const c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const d=3,h=new Ne(this._lodPlanes[s],l),f=l.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*ei-1),_=r/g,m=isFinite(r)?1+Math.floor(d*_):ei;m>ei&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ei}`);const u=[];let E=0;for(let A=0;A<ei;++A){const L=A/_,M=Math.exp(-L*L/2);u.push(M),A===0?E+=M:A<m&&(E+=2*M)}for(let A=0;A<u.length;A++)u[A]=u[A]/E;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=u,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:T}=this;f.dTheta.value=g,f.mipInt.value=T-n;const S=this._sizeLods[s],w=3*S*(s>T-Li?s-T+Li:0),R=4*(this._cubeSize-S);ks(t,w,R,3*S,2*S),c.setRenderTarget(t),c.render(h,Wr)}}function dp(i){const e=[],t=[],n=[];let s=i;const r=i-Li+1+jo.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);t.push(o);let c=1/o;a>i-Li?c=jo[a-i+Li-1]:a===0&&(c=0),n.push(c);const l=1/(o-2),d=-l,h=1+l,f=[d,d,h,d,h,h,d,d,h,h,d,h],p=6,g=6,_=3,m=2,u=1,E=new Float32Array(_*g*p),T=new Float32Array(m*g*p),S=new Float32Array(u*g*p);for(let R=0;R<p;R++){const A=R%3*2/3-1,L=R>2?0:-1,M=[A,L,0,A+2/3,L,0,A+2/3,L+1,0,A,L,0,A+2/3,L+1,0,A,L+1,0];E.set(M,_*g*R),T.set(f,m*g*R);const y=[R,R,R,R,R,R];S.set(y,u*g*R)}const w=new jt;w.setAttribute("position",new ln(E,_)),w.setAttribute("uv",new ln(T,m)),w.setAttribute("faceIndex",new ln(S,u)),e.push(w),s>Li&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Qo(i,e,t){const n=new ai(i,e,t);return n.texture.mapping=lr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ks(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function hp(i,e,t){const n=new Float32Array(ei),s=new O(0,1,0);return new zn({name:"SphericalGaussianBlur",defines:{n:ei,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:eo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function el(){return new zn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:eo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function tl(){return new zn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:eo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function eo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function up(i){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const c=o.mapping,l=c===oa||c===la,d=c===Oi||c===Fi;if(l||d){let h=e.get(o);const f=h!==void 0?h.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return t===null&&(t=new Jo(i)),h=l?t.fromEquirectangular(o,h):t.fromCubemap(o,h),h.texture.pmremVersion=o.pmremVersion,e.set(o,h),h.texture;if(h!==void 0)return h.texture;{const p=o.image;return l&&p&&p.height>0||d&&p&&s(p)?(t===null&&(t=new Jo(i)),h=l?t.fromEquirectangular(o):t.fromCubemap(o),h.texture.pmremVersion=o.pmremVersion,e.set(o,h),o.addEventListener("dispose",r),h.texture):null}}}return o}function s(o){let c=0;const l=6;for(let d=0;d<l;d++)o[d]!==void 0&&c++;return c===l}function r(o){const c=o.target;c.removeEventListener("dispose",r);const l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function fp(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&as("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function pp(i,e,t,n){const s={},r=new WeakMap;function a(h){const f=h.target;f.index!==null&&e.remove(f.index);for(const g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",a),delete s[f.id];const p=r.get(f);p&&(e.remove(p),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(h,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,t.memory.geometries++),f}function c(h){const f=h.attributes;for(const p in f)e.update(f[p],i.ARRAY_BUFFER)}function l(h){const f=[],p=h.index,g=h.attributes.position;let _=0;if(p!==null){const E=p.array;_=p.version;for(let T=0,S=E.length;T<S;T+=3){const w=E[T+0],R=E[T+1],A=E[T+2];f.push(w,R,R,A,A,w)}}else if(g!==void 0){const E=g.array;_=g.version;for(let T=0,S=E.length/3-1;T<S;T+=3){const w=T+0,R=T+1,A=T+2;f.push(w,R,R,A,A,w)}}else return;const m=new(jl(f)?tc:ec)(f,1);m.version=_;const u=r.get(h);u&&e.remove(u),r.set(h,m)}function d(h){const f=r.get(h);if(f){const p=h.index;p!==null&&f.version<p.version&&l(h)}else l(h);return r.get(h)}return{get:o,update:c,getWireframeAttribute:d}}function mp(i,e,t){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function c(f,p){i.drawElements(n,p,r,f*a),t.update(p,n,1)}function l(f,p,g){g!==0&&(i.drawElementsInstanced(n,p,r,f*a,g),t.update(p,n,g))}function d(f,p,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,f,0,g);let m=0;for(let u=0;u<g;u++)m+=p[u];t.update(m,n,1)}function h(f,p,g,_){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let u=0;u<f.length;u++)l(f[u]/a,p[u],_[u]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,f,0,_,0,g);let u=0;for(let E=0;E<g;E++)u+=p[E]*_[E];t.update(u,n,1)}}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=d,this.renderMultiDrawInstances=h}function gp(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function _p(i,e,t){const n=new WeakMap,s=new ft;function r(a,o,c){const l=a.morphTargetInfluences,d=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=d!==void 0?d.length:0;let f=n.get(o);if(f===void 0||f.count!==h){let y=function(){L.dispose(),n.delete(o),o.removeEventListener("dispose",y)};var p=y;f!==void 0&&f.texture.dispose();const g=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,u=o.morphAttributes.position||[],E=o.morphAttributes.normal||[],T=o.morphAttributes.color||[];let S=0;g===!0&&(S=1),_===!0&&(S=2),m===!0&&(S=3);let w=o.attributes.position.count*S,R=1;w>e.maxTextureSize&&(R=Math.ceil(w/e.maxTextureSize),w=e.maxTextureSize);const A=new Float32Array(w*R*4*h),L=new Kl(A,w,R,h);L.type=fn,L.needsUpdate=!0;const M=S*4;for(let I=0;I<h;I++){const N=u[I],B=E[I],X=T[I],G=w*R*4*I;for(let Y=0;Y<N.count;Y++){const Z=Y*M;g===!0&&(s.fromBufferAttribute(N,Y),A[G+Z+0]=s.x,A[G+Z+1]=s.y,A[G+Z+2]=s.z,A[G+Z+3]=0),_===!0&&(s.fromBufferAttribute(B,Y),A[G+Z+4]=s.x,A[G+Z+5]=s.y,A[G+Z+6]=s.z,A[G+Z+7]=0),m===!0&&(s.fromBufferAttribute(X,Y),A[G+Z+8]=s.x,A[G+Z+9]=s.y,A[G+Z+10]=s.z,A[G+Z+11]=X.itemSize===4?s.w:1)}}f={count:h,texture:L,size:new qe(w,R)},n.set(o,f),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let g=0;for(let m=0;m<l.length;m++)g+=l[m];const _=o.morphTargetsRelative?1:1-g;c.getUniforms().setValue(i,"morphTargetBaseInfluence",_),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function vp(i,e,t,n){let s=new WeakMap;function r(c){const l=n.render.frame,d=c.geometry,h=e.get(c,d);if(s.get(h)!==l&&(e.update(h),s.set(h,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),s.get(c)!==l&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),s.set(c,l))),c.isSkinnedMesh){const f=c.skeleton;s.get(f)!==l&&(f.update(),s.set(f,l))}return h}function a(){s=new WeakMap}function o(c){const l=c.target;l.removeEventListener("dispose",o),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:a}}const hc=new Lt,nl=new ac(1,1),uc=new Kl,fc=new Od,pc=new sc,il=[],sl=[],rl=new Float32Array(16),al=new Float32Array(9),ol=new Float32Array(4);function Wi(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=il[s];if(r===void 0&&(r=new Float32Array(s),il[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function St(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Et(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function cr(i,e){let t=sl[e];t===void 0&&(t=new Int32Array(e),sl[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function xp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Mp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(St(t,e))return;i.uniform2fv(this.addr,e),Et(t,e)}}function yp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(St(t,e))return;i.uniform3fv(this.addr,e),Et(t,e)}}function Sp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(St(t,e))return;i.uniform4fv(this.addr,e),Et(t,e)}}function Ep(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(St(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Et(t,e)}else{if(St(t,n))return;ol.set(n),i.uniformMatrix2fv(this.addr,!1,ol),Et(t,n)}}function bp(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(St(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Et(t,e)}else{if(St(t,n))return;al.set(n),i.uniformMatrix3fv(this.addr,!1,al),Et(t,n)}}function Tp(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(St(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Et(t,e)}else{if(St(t,n))return;rl.set(n),i.uniformMatrix4fv(this.addr,!1,rl),Et(t,n)}}function Ap(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function wp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(St(t,e))return;i.uniform2iv(this.addr,e),Et(t,e)}}function Rp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(St(t,e))return;i.uniform3iv(this.addr,e),Et(t,e)}}function Cp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(St(t,e))return;i.uniform4iv(this.addr,e),Et(t,e)}}function Ip(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Pp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(St(t,e))return;i.uniform2uiv(this.addr,e),Et(t,e)}}function Lp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(St(t,e))return;i.uniform3uiv(this.addr,e),Et(t,e)}}function Dp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(St(t,e))return;i.uniform4uiv(this.addr,e),Et(t,e)}}function Up(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(nl.compareFunction=ql,r=nl):r=hc,t.setTexture2D(e||r,s)}function Np(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||fc,s)}function Op(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||pc,s)}function Fp(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||uc,s)}function Bp(i){switch(i){case 5126:return xp;case 35664:return Mp;case 35665:return yp;case 35666:return Sp;case 35674:return Ep;case 35675:return bp;case 35676:return Tp;case 5124:case 35670:return Ap;case 35667:case 35671:return wp;case 35668:case 35672:return Rp;case 35669:case 35673:return Cp;case 5125:return Ip;case 36294:return Pp;case 36295:return Lp;case 36296:return Dp;case 35678:case 36198:case 36298:case 36306:case 35682:return Up;case 35679:case 36299:case 36307:return Np;case 35680:case 36300:case 36308:case 36293:return Op;case 36289:case 36303:case 36311:case 36292:return Fp}}function kp(i,e){i.uniform1fv(this.addr,e)}function Hp(i,e){const t=Wi(e,this.size,2);i.uniform2fv(this.addr,t)}function zp(i,e){const t=Wi(e,this.size,3);i.uniform3fv(this.addr,t)}function Gp(i,e){const t=Wi(e,this.size,4);i.uniform4fv(this.addr,t)}function Vp(i,e){const t=Wi(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function $p(i,e){const t=Wi(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Wp(i,e){const t=Wi(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Xp(i,e){i.uniform1iv(this.addr,e)}function Yp(i,e){i.uniform2iv(this.addr,e)}function qp(i,e){i.uniform3iv(this.addr,e)}function jp(i,e){i.uniform4iv(this.addr,e)}function Kp(i,e){i.uniform1uiv(this.addr,e)}function Zp(i,e){i.uniform2uiv(this.addr,e)}function Jp(i,e){i.uniform3uiv(this.addr,e)}function Qp(i,e){i.uniform4uiv(this.addr,e)}function em(i,e,t){const n=this.cache,s=e.length,r=cr(t,s);St(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));for(let a=0;a!==s;++a)t.setTexture2D(e[a]||hc,r[a])}function tm(i,e,t){const n=this.cache,s=e.length,r=cr(t,s);St(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||fc,r[a])}function nm(i,e,t){const n=this.cache,s=e.length,r=cr(t,s);St(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||pc,r[a])}function im(i,e,t){const n=this.cache,s=e.length,r=cr(t,s);St(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||uc,r[a])}function sm(i){switch(i){case 5126:return kp;case 35664:return Hp;case 35665:return zp;case 35666:return Gp;case 35674:return Vp;case 35675:return $p;case 35676:return Wp;case 5124:case 35670:return Xp;case 35667:case 35671:return Yp;case 35668:case 35672:return qp;case 35669:case 35673:return jp;case 5125:return Kp;case 36294:return Zp;case 36295:return Jp;case 36296:return Qp;case 35678:case 36198:case 36298:case 36306:case 35682:return em;case 35679:case 36299:case 36307:return tm;case 35680:case 36300:case 36308:case 36293:return nm;case 36289:case 36303:case 36311:case 36292:return im}}class rm{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Bp(t.type)}}class am{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=sm(t.type)}}class om{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const Kr=/(\w+)(\])?(\[|\.)?/g;function ll(i,e){i.seq.push(e),i.map[e.id]=e}function lm(i,e,t){const n=i.name,s=n.length;for(Kr.lastIndex=0;;){const r=Kr.exec(n),a=Kr.lastIndex;let o=r[1];const c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){ll(t,l===void 0?new rm(o,i,e):new am(o,i,e));break}else{let h=t.map[o];h===void 0&&(h=new om(o),ll(t,h)),t=h}}}class Ks{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=e.getActiveUniform(t,s),a=e.getUniformLocation(t,r.name);lm(r,a,this)}}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function cl(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const cm=37297;let dm=0;function hm(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const dl=new Be;function um(i){Ke._getMatrix(dl,Ke.workingColorSpace,i);const e=`mat3( ${dl.elements.map(t=>t.toFixed(4))} )`;switch(Ke.getTransfer(i)){case Qs:return[e,"LinearTransferOETF"];case et:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function hl(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+hm(i.getShaderSource(e),o)}else return r}function fm(i,e){const t=um(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function pm(i,e){let t;switch(e){case hd:t="Linear";break;case ud:t="Reinhard";break;case fd:t="Cineon";break;case Bl:t="ACESFilmic";break;case md:t="AgX";break;case gd:t="Neutral";break;case pd:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Hs=new O;function mm(){Ke.getLuminanceCoefficients(Hs);const i=Hs.x.toFixed(4),e=Hs.y.toFixed(4),t=Hs.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function gm(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ts).join(`
`)}function _m(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function vm(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function ts(i){return i!==""}function ul(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function fl(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const xm=/^[ \t]*#include +<([\w\d./]+)>/gm;function ka(i){return i.replace(xm,ym)}const Mm=new Map;function ym(i,e){let t=He[e];if(t===void 0){const n=Mm.get(e);if(n!==void 0)t=He[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return ka(t)}const Sm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function pl(i){return i.replace(Sm,Em)}function Em(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function ml(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function bm(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Nl?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Ol?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Tn&&(e="SHADOWMAP_TYPE_VSM"),e}function Tm(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Oi:case Fi:e="ENVMAP_TYPE_CUBE";break;case lr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Am(i){let e="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===Fi&&(e="ENVMAP_MODE_REFRACTION"),e}function wm(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Fl:e="ENVMAP_BLENDING_MULTIPLY";break;case cd:e="ENVMAP_BLENDING_MIX";break;case dd:e="ENVMAP_BLENDING_ADD";break}return e}function Rm(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Cm(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const c=bm(t),l=Tm(t),d=Am(t),h=wm(t),f=Rm(t),p=gm(t),g=_m(r),_=s.createProgram();let m,u,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ts).join(`
`),m.length>0&&(m+=`
`),u=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ts).join(`
`),u.length>0&&(u+=`
`)):(m=[ml(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ts).join(`
`),u=[ml(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+d:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==kn?"#define TONE_MAPPING":"",t.toneMapping!==kn?He.tonemapping_pars_fragment:"",t.toneMapping!==kn?pm("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",He.colorspace_pars_fragment,fm("linearToOutputTexel",t.outputColorSpace),mm(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ts).join(`
`)),a=ka(a),a=ul(a,t),a=fl(a,t),o=ka(o),o=ul(o,t),o=fl(o,t),a=pl(a),o=pl(o),t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,u=["#define varying in",t.glslVersion===Mo?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Mo?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+u);const T=E+m+a,S=E+u+o,w=cl(s,s.VERTEX_SHADER,T),R=cl(s,s.FRAGMENT_SHADER,S);s.attachShader(_,w),s.attachShader(_,R),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function A(I){if(i.debug.checkShaderErrors){const N=s.getProgramInfoLog(_)||"",B=s.getShaderInfoLog(w)||"",X=s.getShaderInfoLog(R)||"",G=N.trim(),Y=B.trim(),Z=X.trim();let $=!0,oe=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if($=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,w,R);else{const he=hl(s,w,"vertex"),be=hl(s,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+G+`
`+he+`
`+be)}else G!==""?console.warn("THREE.WebGLProgram: Program Info Log:",G):(Y===""||Z==="")&&(oe=!1);oe&&(I.diagnostics={runnable:$,programLog:G,vertexShader:{log:Y,prefix:m},fragmentShader:{log:Z,prefix:u}})}s.deleteShader(w),s.deleteShader(R),L=new Ks(s,_),M=vm(s,_)}let L;this.getUniforms=function(){return L===void 0&&A(this),L};let M;this.getAttributes=function(){return M===void 0&&A(this),M};let y=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=s.getProgramParameter(_,cm)),y},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=dm++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=w,this.fragmentShader=R,this}let Im=0;class Pm{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new Lm(e),t.set(e,n)),n}}class Lm{constructor(e){this.id=Im++,this.code=e,this.usedTimes=0}}function Dm(i,e,t,n,s,r,a){const o=new Jl,c=new Pm,l=new Set,d=[],h=s.logarithmicDepthBuffer,f=s.vertexTextures;let p=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(M){return l.add(M),M===0?"uv":`uv${M}`}function m(M,y,I,N,B){const X=N.fog,G=B.geometry,Y=M.isMeshStandardMaterial?N.environment:null,Z=(M.isMeshStandardMaterial?t:e).get(M.envMap||Y),$=Z&&Z.mapping===lr?Z.image.height:null,oe=g[M.type];M.precision!==null&&(p=s.getMaxPrecision(M.precision),p!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",p,"instead."));const he=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,be=he!==void 0?he.length:0;let Ge=0;G.morphAttributes.position!==void 0&&(Ge=1),G.morphAttributes.normal!==void 0&&(Ge=2),G.morphAttributes.color!==void 0&&(Ge=3);let it,ot,Ze,j;if(oe){const Je=dn[oe];it=Je.vertexShader,ot=Je.fragmentShader}else it=M.vertexShader,ot=M.fragmentShader,c.update(M),Ze=c.getVertexShaderID(M),j=c.getFragmentShaderID(M);const Q=i.getRenderTarget(),pe=i.state.buffers.depth.getReversed(),De=B.isInstancedMesh===!0,Ee=B.isBatchedMesh===!0,Xe=!!M.map,Rt=!!M.matcap,C=!!Z,lt=!!M.aoMap,Oe=!!M.lightMap,Pe=!!M.bumpMap,_e=!!M.normalMap,ct=!!M.displacementMap,ve=!!M.emissiveMap,ke=!!M.metalnessMap,bt=!!M.roughnessMap,mt=M.anisotropy>0,b=M.clearcoat>0,v=M.dispersion>0,F=M.iridescence>0,q=M.sheen>0,J=M.transmission>0,W=mt&&!!M.anisotropyMap,Se=b&&!!M.clearcoatMap,se=b&&!!M.clearcoatNormalMap,xe=b&&!!M.clearcoatRoughnessMap,Me=F&&!!M.iridescenceMap,ne=F&&!!M.iridescenceThicknessMap,de=q&&!!M.sheenColorMap,Ie=q&&!!M.sheenRoughnessMap,ye=!!M.specularMap,le=!!M.specularColorMap,Fe=!!M.specularIntensityMap,P=J&&!!M.transmissionMap,ie=J&&!!M.thicknessMap,re=!!M.gradientMap,fe=!!M.alphaMap,ee=M.alphaTest>0,K=!!M.alphaHash,ge=!!M.extensions;let Ue=kn;M.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(Ue=i.toneMapping);const st={shaderID:oe,shaderType:M.type,shaderName:M.name,vertexShader:it,fragmentShader:ot,defines:M.defines,customVertexShaderID:Ze,customFragmentShaderID:j,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:p,batching:Ee,batchingColor:Ee&&B._colorsTexture!==null,instancing:De,instancingColor:De&&B.instanceColor!==null,instancingMorph:De&&B.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:Q===null?i.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:Bi,alphaToCoverage:!!M.alphaToCoverage,map:Xe,matcap:Rt,envMap:C,envMapMode:C&&Z.mapping,envMapCubeUVHeight:$,aoMap:lt,lightMap:Oe,bumpMap:Pe,normalMap:_e,displacementMap:f&&ct,emissiveMap:ve,normalMapObjectSpace:_e&&M.normalMapType===Md,normalMapTangentSpace:_e&&M.normalMapType===Yl,metalnessMap:ke,roughnessMap:bt,anisotropy:mt,anisotropyMap:W,clearcoat:b,clearcoatMap:Se,clearcoatNormalMap:se,clearcoatRoughnessMap:xe,dispersion:v,iridescence:F,iridescenceMap:Me,iridescenceThicknessMap:ne,sheen:q,sheenColorMap:de,sheenRoughnessMap:Ie,specularMap:ye,specularColorMap:le,specularIntensityMap:Fe,transmission:J,transmissionMap:P,thicknessMap:ie,gradientMap:re,opaque:M.transparent===!1&&M.blending===Di&&M.alphaToCoverage===!1,alphaMap:fe,alphaTest:ee,alphaHash:K,combine:M.combine,mapUv:Xe&&_(M.map.channel),aoMapUv:lt&&_(M.aoMap.channel),lightMapUv:Oe&&_(M.lightMap.channel),bumpMapUv:Pe&&_(M.bumpMap.channel),normalMapUv:_e&&_(M.normalMap.channel),displacementMapUv:ct&&_(M.displacementMap.channel),emissiveMapUv:ve&&_(M.emissiveMap.channel),metalnessMapUv:ke&&_(M.metalnessMap.channel),roughnessMapUv:bt&&_(M.roughnessMap.channel),anisotropyMapUv:W&&_(M.anisotropyMap.channel),clearcoatMapUv:Se&&_(M.clearcoatMap.channel),clearcoatNormalMapUv:se&&_(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&_(M.clearcoatRoughnessMap.channel),iridescenceMapUv:Me&&_(M.iridescenceMap.channel),iridescenceThicknessMapUv:ne&&_(M.iridescenceThicknessMap.channel),sheenColorMapUv:de&&_(M.sheenColorMap.channel),sheenRoughnessMapUv:Ie&&_(M.sheenRoughnessMap.channel),specularMapUv:ye&&_(M.specularMap.channel),specularColorMapUv:le&&_(M.specularColorMap.channel),specularIntensityMapUv:Fe&&_(M.specularIntensityMap.channel),transmissionMapUv:P&&_(M.transmissionMap.channel),thicknessMapUv:ie&&_(M.thicknessMap.channel),alphaMapUv:fe&&_(M.alphaMap.channel),vertexTangents:!!G.attributes.tangent&&(_e||mt),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!G.attributes.uv&&(Xe||fe),fog:!!X,useFog:M.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:M.flatShading===!0&&M.wireframe===!1,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:pe,skinning:B.isSkinnedMesh===!0,morphTargets:G.morphAttributes.position!==void 0,morphNormals:G.morphAttributes.normal!==void 0,morphColors:G.morphAttributes.color!==void 0,morphTargetsCount:be,morphTextureStride:Ge,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:M.dithering,shadowMapEnabled:i.shadowMap.enabled&&I.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ue,decodeVideoTexture:Xe&&M.map.isVideoTexture===!0&&Ke.getTransfer(M.map.colorSpace)===et,decodeVideoTextureEmissive:ve&&M.emissiveMap.isVideoTexture===!0&&Ke.getTransfer(M.emissiveMap.colorSpace)===et,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===hn,flipSided:M.side===zt,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:ge&&M.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ge&&M.extensions.multiDraw===!0||Ee)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return st.vertexUv1s=l.has(1),st.vertexUv2s=l.has(2),st.vertexUv3s=l.has(3),l.clear(),st}function u(M){const y=[];if(M.shaderID?y.push(M.shaderID):(y.push(M.customVertexShaderID),y.push(M.customFragmentShaderID)),M.defines!==void 0)for(const I in M.defines)y.push(I),y.push(M.defines[I]);return M.isRawShaderMaterial===!1&&(E(y,M),T(y,M),y.push(i.outputColorSpace)),y.push(M.customProgramCacheKey),y.join()}function E(M,y){M.push(y.precision),M.push(y.outputColorSpace),M.push(y.envMapMode),M.push(y.envMapCubeUVHeight),M.push(y.mapUv),M.push(y.alphaMapUv),M.push(y.lightMapUv),M.push(y.aoMapUv),M.push(y.bumpMapUv),M.push(y.normalMapUv),M.push(y.displacementMapUv),M.push(y.emissiveMapUv),M.push(y.metalnessMapUv),M.push(y.roughnessMapUv),M.push(y.anisotropyMapUv),M.push(y.clearcoatMapUv),M.push(y.clearcoatNormalMapUv),M.push(y.clearcoatRoughnessMapUv),M.push(y.iridescenceMapUv),M.push(y.iridescenceThicknessMapUv),M.push(y.sheenColorMapUv),M.push(y.sheenRoughnessMapUv),M.push(y.specularMapUv),M.push(y.specularColorMapUv),M.push(y.specularIntensityMapUv),M.push(y.transmissionMapUv),M.push(y.thicknessMapUv),M.push(y.combine),M.push(y.fogExp2),M.push(y.sizeAttenuation),M.push(y.morphTargetsCount),M.push(y.morphAttributeCount),M.push(y.numDirLights),M.push(y.numPointLights),M.push(y.numSpotLights),M.push(y.numSpotLightMaps),M.push(y.numHemiLights),M.push(y.numRectAreaLights),M.push(y.numDirLightShadows),M.push(y.numPointLightShadows),M.push(y.numSpotLightShadows),M.push(y.numSpotLightShadowsWithMaps),M.push(y.numLightProbes),M.push(y.shadowMapType),M.push(y.toneMapping),M.push(y.numClippingPlanes),M.push(y.numClipIntersection),M.push(y.depthPacking)}function T(M,y){o.disableAll(),y.supportsVertexTextures&&o.enable(0),y.instancing&&o.enable(1),y.instancingColor&&o.enable(2),y.instancingMorph&&o.enable(3),y.matcap&&o.enable(4),y.envMap&&o.enable(5),y.normalMapObjectSpace&&o.enable(6),y.normalMapTangentSpace&&o.enable(7),y.clearcoat&&o.enable(8),y.iridescence&&o.enable(9),y.alphaTest&&o.enable(10),y.vertexColors&&o.enable(11),y.vertexAlphas&&o.enable(12),y.vertexUv1s&&o.enable(13),y.vertexUv2s&&o.enable(14),y.vertexUv3s&&o.enable(15),y.vertexTangents&&o.enable(16),y.anisotropy&&o.enable(17),y.alphaHash&&o.enable(18),y.batching&&o.enable(19),y.dispersion&&o.enable(20),y.batchingColor&&o.enable(21),y.gradientMap&&o.enable(22),M.push(o.mask),o.disableAll(),y.fog&&o.enable(0),y.useFog&&o.enable(1),y.flatShading&&o.enable(2),y.logarithmicDepthBuffer&&o.enable(3),y.reversedDepthBuffer&&o.enable(4),y.skinning&&o.enable(5),y.morphTargets&&o.enable(6),y.morphNormals&&o.enable(7),y.morphColors&&o.enable(8),y.premultipliedAlpha&&o.enable(9),y.shadowMapEnabled&&o.enable(10),y.doubleSided&&o.enable(11),y.flipSided&&o.enable(12),y.useDepthPacking&&o.enable(13),y.dithering&&o.enable(14),y.transmission&&o.enable(15),y.sheen&&o.enable(16),y.opaque&&o.enable(17),y.pointsUvs&&o.enable(18),y.decodeVideoTexture&&o.enable(19),y.decodeVideoTextureEmissive&&o.enable(20),y.alphaToCoverage&&o.enable(21),M.push(o.mask)}function S(M){const y=g[M.type];let I;if(y){const N=dn[y];I=jd.clone(N.uniforms)}else I=M.uniforms;return I}function w(M,y){let I;for(let N=0,B=d.length;N<B;N++){const X=d[N];if(X.cacheKey===y){I=X,++I.usedTimes;break}}return I===void 0&&(I=new Cm(i,y,M,r),d.push(I)),I}function R(M){if(--M.usedTimes===0){const y=d.indexOf(M);d[y]=d[d.length-1],d.pop(),M.destroy()}}function A(M){c.remove(M)}function L(){c.dispose()}return{getParameters:m,getProgramCacheKey:u,getUniforms:S,acquireProgram:w,releaseProgram:R,releaseShaderCache:A,programs:d,dispose:L}}function Um(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,c){i.get(a)[o]=c}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function Nm(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function gl(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function _l(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(h,f,p,g,_,m){let u=i[e];return u===void 0?(u={id:h.id,object:h,geometry:f,material:p,groupOrder:g,renderOrder:h.renderOrder,z:_,group:m},i[e]=u):(u.id=h.id,u.object=h,u.geometry=f,u.material=p,u.groupOrder=g,u.renderOrder=h.renderOrder,u.z=_,u.group=m),e++,u}function o(h,f,p,g,_,m){const u=a(h,f,p,g,_,m);p.transmission>0?n.push(u):p.transparent===!0?s.push(u):t.push(u)}function c(h,f,p,g,_,m){const u=a(h,f,p,g,_,m);p.transmission>0?n.unshift(u):p.transparent===!0?s.unshift(u):t.unshift(u)}function l(h,f){t.length>1&&t.sort(h||Nm),n.length>1&&n.sort(f||gl),s.length>1&&s.sort(f||gl)}function d(){for(let h=e,f=i.length;h<f;h++){const p=i[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:o,unshift:c,finish:d,sort:l}}function Om(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new _l,i.set(n,[a])):s>=r.length?(a=new _l,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function Fm(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new O,color:new ze};break;case"SpotLight":t={position:new O,direction:new O,color:new ze,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new O,color:new ze,distance:0,decay:0};break;case"HemisphereLight":t={direction:new O,skyColor:new ze,groundColor:new ze};break;case"RectAreaLight":t={color:new ze,position:new O,halfWidth:new O,halfHeight:new O};break}return i[e.id]=t,t}}}function Bm(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new qe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new qe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new qe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let km=0;function Hm(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function zm(i){const e=new Fm,t=Bm(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new O);const s=new O,r=new at,a=new at;function o(l){let d=0,h=0,f=0;for(let M=0;M<9;M++)n.probe[M].set(0,0,0);let p=0,g=0,_=0,m=0,u=0,E=0,T=0,S=0,w=0,R=0,A=0;l.sort(Hm);for(let M=0,y=l.length;M<y;M++){const I=l[M],N=I.color,B=I.intensity,X=I.distance,G=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)d+=N.r*B,h+=N.g*B,f+=N.b*B;else if(I.isLightProbe){for(let Y=0;Y<9;Y++)n.probe[Y].addScaledVector(I.sh.coefficients[Y],B);A++}else if(I.isDirectionalLight){const Y=e.get(I);if(Y.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){const Z=I.shadow,$=t.get(I);$.shadowIntensity=Z.intensity,$.shadowBias=Z.bias,$.shadowNormalBias=Z.normalBias,$.shadowRadius=Z.radius,$.shadowMapSize=Z.mapSize,n.directionalShadow[p]=$,n.directionalShadowMap[p]=G,n.directionalShadowMatrix[p]=I.shadow.matrix,E++}n.directional[p]=Y,p++}else if(I.isSpotLight){const Y=e.get(I);Y.position.setFromMatrixPosition(I.matrixWorld),Y.color.copy(N).multiplyScalar(B),Y.distance=X,Y.coneCos=Math.cos(I.angle),Y.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),Y.decay=I.decay,n.spot[_]=Y;const Z=I.shadow;if(I.map&&(n.spotLightMap[w]=I.map,w++,Z.updateMatrices(I),I.castShadow&&R++),n.spotLightMatrix[_]=Z.matrix,I.castShadow){const $=t.get(I);$.shadowIntensity=Z.intensity,$.shadowBias=Z.bias,$.shadowNormalBias=Z.normalBias,$.shadowRadius=Z.radius,$.shadowMapSize=Z.mapSize,n.spotShadow[_]=$,n.spotShadowMap[_]=G,S++}_++}else if(I.isRectAreaLight){const Y=e.get(I);Y.color.copy(N).multiplyScalar(B),Y.halfWidth.set(I.width*.5,0,0),Y.halfHeight.set(0,I.height*.5,0),n.rectArea[m]=Y,m++}else if(I.isPointLight){const Y=e.get(I);if(Y.color.copy(I.color).multiplyScalar(I.intensity),Y.distance=I.distance,Y.decay=I.decay,I.castShadow){const Z=I.shadow,$=t.get(I);$.shadowIntensity=Z.intensity,$.shadowBias=Z.bias,$.shadowNormalBias=Z.normalBias,$.shadowRadius=Z.radius,$.shadowMapSize=Z.mapSize,$.shadowCameraNear=Z.camera.near,$.shadowCameraFar=Z.camera.far,n.pointShadow[g]=$,n.pointShadowMap[g]=G,n.pointShadowMatrix[g]=I.shadow.matrix,T++}n.point[g]=Y,g++}else if(I.isHemisphereLight){const Y=e.get(I);Y.skyColor.copy(I.color).multiplyScalar(B),Y.groundColor.copy(I.groundColor).multiplyScalar(B),n.hemi[u]=Y,u++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ae.LTC_FLOAT_1,n.rectAreaLTC2=ae.LTC_FLOAT_2):(n.rectAreaLTC1=ae.LTC_HALF_1,n.rectAreaLTC2=ae.LTC_HALF_2)),n.ambient[0]=d,n.ambient[1]=h,n.ambient[2]=f;const L=n.hash;(L.directionalLength!==p||L.pointLength!==g||L.spotLength!==_||L.rectAreaLength!==m||L.hemiLength!==u||L.numDirectionalShadows!==E||L.numPointShadows!==T||L.numSpotShadows!==S||L.numSpotMaps!==w||L.numLightProbes!==A)&&(n.directional.length=p,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=u,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.pointShadow.length=T,n.pointShadowMap.length=T,n.spotShadow.length=S,n.spotShadowMap.length=S,n.directionalShadowMatrix.length=E,n.pointShadowMatrix.length=T,n.spotLightMatrix.length=S+w-R,n.spotLightMap.length=w,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=A,L.directionalLength=p,L.pointLength=g,L.spotLength=_,L.rectAreaLength=m,L.hemiLength=u,L.numDirectionalShadows=E,L.numPointShadows=T,L.numSpotShadows=S,L.numSpotMaps=w,L.numLightProbes=A,n.version=km++)}function c(l,d){let h=0,f=0,p=0,g=0,_=0;const m=d.matrixWorldInverse;for(let u=0,E=l.length;u<E;u++){const T=l[u];if(T.isDirectionalLight){const S=n.directional[h];S.direction.setFromMatrixPosition(T.matrixWorld),s.setFromMatrixPosition(T.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),h++}else if(T.isSpotLight){const S=n.spot[p];S.position.setFromMatrixPosition(T.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(T.matrixWorld),s.setFromMatrixPosition(T.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),p++}else if(T.isRectAreaLight){const S=n.rectArea[g];S.position.setFromMatrixPosition(T.matrixWorld),S.position.applyMatrix4(m),a.identity(),r.copy(T.matrixWorld),r.premultiply(m),a.extractRotation(r),S.halfWidth.set(T.width*.5,0,0),S.halfHeight.set(0,T.height*.5,0),S.halfWidth.applyMatrix4(a),S.halfHeight.applyMatrix4(a),g++}else if(T.isPointLight){const S=n.point[f];S.position.setFromMatrixPosition(T.matrixWorld),S.position.applyMatrix4(m),f++}else if(T.isHemisphereLight){const S=n.hemi[_];S.direction.setFromMatrixPosition(T.matrixWorld),S.direction.transformDirection(m),_++}}}return{setup:o,setupView:c,state:n}}function vl(i){const e=new zm(i),t=[],n=[];function s(d){l.camera=d,t.length=0,n.length=0}function r(d){t.push(d)}function a(d){n.push(d)}function o(){e.setup(t)}function c(d){e.setupView(t,d)}const l={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:l,setupLights:o,setupLightsView:c,pushLight:r,pushShadow:a}}function Gm(i){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new vl(i),e.set(s,[o])):r>=a.length?(o=new vl(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const Vm=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,$m=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Wm(i,e,t){let n=new Ja;const s=new qe,r=new qe,a=new ft,o=new uh({depthPacking:xd}),c=new fh,l={},d=t.maxTextureSize,h={[Hn]:zt,[zt]:Hn,[hn]:hn},f=new zn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new qe},radius:{value:4}},vertexShader:Vm,fragmentShader:$m}),p=f.clone();p.defines.HORIZONTAL_PASS=1;const g=new jt;g.setAttribute("position",new ln(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new Ne(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Nl;let u=this.type;this.render=function(R,A,L){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;const M=i.getRenderTarget(),y=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),N=i.state;N.setBlending(Bn),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);const B=u!==Tn&&this.type===Tn,X=u===Tn&&this.type!==Tn;for(let G=0,Y=R.length;G<Y;G++){const Z=R[G],$=Z.shadow;if($===void 0){console.warn("THREE.WebGLShadowMap:",Z,"has no shadow.");continue}if($.autoUpdate===!1&&$.needsUpdate===!1)continue;s.copy($.mapSize);const oe=$.getFrameExtents();if(s.multiply(oe),r.copy($.mapSize),(s.x>d||s.y>d)&&(s.x>d&&(r.x=Math.floor(d/oe.x),s.x=r.x*oe.x,$.mapSize.x=r.x),s.y>d&&(r.y=Math.floor(d/oe.y),s.y=r.y*oe.y,$.mapSize.y=r.y)),$.map===null||B===!0||X===!0){const be=this.type!==Tn?{minFilter:qt,magFilter:qt}:{};$.map!==null&&$.map.dispose(),$.map=new ai(s.x,s.y,be),$.map.texture.name=Z.name+".shadowMap",$.camera.updateProjectionMatrix()}i.setRenderTarget($.map),i.clear();const he=$.getViewportCount();for(let be=0;be<he;be++){const Ge=$.getViewport(be);a.set(r.x*Ge.x,r.y*Ge.y,r.x*Ge.z,r.y*Ge.w),N.viewport(a),$.updateMatrices(Z,be),n=$.getFrustum(),S(A,L,$.camera,Z,this.type)}$.isPointLightShadow!==!0&&this.type===Tn&&E($,L),$.needsUpdate=!1}u=this.type,m.needsUpdate=!1,i.setRenderTarget(M,y,I)};function E(R,A){const L=e.update(_);f.defines.VSM_SAMPLES!==R.blurSamples&&(f.defines.VSM_SAMPLES=R.blurSamples,p.defines.VSM_SAMPLES=R.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new ai(s.x,s.y)),f.uniforms.shadow_pass.value=R.map.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(A,null,L,f,_,null),p.uniforms.shadow_pass.value=R.mapPass.texture,p.uniforms.resolution.value=R.mapSize,p.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(A,null,L,p,_,null)}function T(R,A,L,M){let y=null;const I=L.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(I!==void 0)y=I;else if(y=L.isPointLight===!0?c:o,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){const N=y.uuid,B=A.uuid;let X=l[N];X===void 0&&(X={},l[N]=X);let G=X[B];G===void 0&&(G=y.clone(),X[B]=G,A.addEventListener("dispose",w)),y=G}if(y.visible=A.visible,y.wireframe=A.wireframe,M===Tn?y.side=A.shadowSide!==null?A.shadowSide:A.side:y.side=A.shadowSide!==null?A.shadowSide:h[A.side],y.alphaMap=A.alphaMap,y.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,y.map=A.map,y.clipShadows=A.clipShadows,y.clippingPlanes=A.clippingPlanes,y.clipIntersection=A.clipIntersection,y.displacementMap=A.displacementMap,y.displacementScale=A.displacementScale,y.displacementBias=A.displacementBias,y.wireframeLinewidth=A.wireframeLinewidth,y.linewidth=A.linewidth,L.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const N=i.properties.get(y);N.light=L}return y}function S(R,A,L,M,y){if(R.visible===!1)return;if(R.layers.test(A.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&y===Tn)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,R.matrixWorld);const B=e.update(R),X=R.material;if(Array.isArray(X)){const G=B.groups;for(let Y=0,Z=G.length;Y<Z;Y++){const $=G[Y],oe=X[$.materialIndex];if(oe&&oe.visible){const he=T(R,oe,M,y);R.onBeforeShadow(i,R,A,L,B,he,$),i.renderBufferDirect(L,null,B,he,R,$),R.onAfterShadow(i,R,A,L,B,he,$)}}}else if(X.visible){const G=T(R,X,M,y);R.onBeforeShadow(i,R,A,L,B,G,null),i.renderBufferDirect(L,null,B,G,R,null),R.onAfterShadow(i,R,A,L,B,G,null)}}const N=R.children;for(let B=0,X=N.length;B<X;B++)S(N[B],A,L,M,y)}function w(R){R.target.removeEventListener("dispose",w);for(const L in l){const M=l[L],y=R.target.uuid;y in M&&(M[y].dispose(),delete M[y])}}}const Xm={[ea]:ta,[na]:ra,[ia]:aa,[Ni]:sa,[ta]:ea,[ra]:na,[aa]:ia,[sa]:Ni};function Ym(i,e){function t(){let P=!1;const ie=new ft;let re=null;const fe=new ft(0,0,0,0);return{setMask:function(ee){re!==ee&&!P&&(i.colorMask(ee,ee,ee,ee),re=ee)},setLocked:function(ee){P=ee},setClear:function(ee,K,ge,Ue,st){st===!0&&(ee*=Ue,K*=Ue,ge*=Ue),ie.set(ee,K,ge,Ue),fe.equals(ie)===!1&&(i.clearColor(ee,K,ge,Ue),fe.copy(ie))},reset:function(){P=!1,re=null,fe.set(-1,0,0,0)}}}function n(){let P=!1,ie=!1,re=null,fe=null,ee=null;return{setReversed:function(K){if(ie!==K){const ge=e.get("EXT_clip_control");K?ge.clipControlEXT(ge.LOWER_LEFT_EXT,ge.ZERO_TO_ONE_EXT):ge.clipControlEXT(ge.LOWER_LEFT_EXT,ge.NEGATIVE_ONE_TO_ONE_EXT),ie=K;const Ue=ee;ee=null,this.setClear(Ue)}},getReversed:function(){return ie},setTest:function(K){K?Q(i.DEPTH_TEST):pe(i.DEPTH_TEST)},setMask:function(K){re!==K&&!P&&(i.depthMask(K),re=K)},setFunc:function(K){if(ie&&(K=Xm[K]),fe!==K){switch(K){case ea:i.depthFunc(i.NEVER);break;case ta:i.depthFunc(i.ALWAYS);break;case na:i.depthFunc(i.LESS);break;case Ni:i.depthFunc(i.LEQUAL);break;case ia:i.depthFunc(i.EQUAL);break;case sa:i.depthFunc(i.GEQUAL);break;case ra:i.depthFunc(i.GREATER);break;case aa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}fe=K}},setLocked:function(K){P=K},setClear:function(K){ee!==K&&(ie&&(K=1-K),i.clearDepth(K),ee=K)},reset:function(){P=!1,re=null,fe=null,ee=null,ie=!1}}}function s(){let P=!1,ie=null,re=null,fe=null,ee=null,K=null,ge=null,Ue=null,st=null;return{setTest:function(Je){P||(Je?Q(i.STENCIL_TEST):pe(i.STENCIL_TEST))},setMask:function(Je){ie!==Je&&!P&&(i.stencilMask(Je),ie=Je)},setFunc:function(Je,xn,cn){(re!==Je||fe!==xn||ee!==cn)&&(i.stencilFunc(Je,xn,cn),re=Je,fe=xn,ee=cn)},setOp:function(Je,xn,cn){(K!==Je||ge!==xn||Ue!==cn)&&(i.stencilOp(Je,xn,cn),K=Je,ge=xn,Ue=cn)},setLocked:function(Je){P=Je},setClear:function(Je){st!==Je&&(i.clearStencil(Je),st=Je)},reset:function(){P=!1,ie=null,re=null,fe=null,ee=null,K=null,ge=null,Ue=null,st=null}}}const r=new t,a=new n,o=new s,c=new WeakMap,l=new WeakMap;let d={},h={},f=new WeakMap,p=[],g=null,_=!1,m=null,u=null,E=null,T=null,S=null,w=null,R=null,A=new ze(0,0,0),L=0,M=!1,y=null,I=null,N=null,B=null,X=null;const G=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Y=!1,Z=0;const $=i.getParameter(i.VERSION);$.indexOf("WebGL")!==-1?(Z=parseFloat(/^WebGL (\d)/.exec($)[1]),Y=Z>=1):$.indexOf("OpenGL ES")!==-1&&(Z=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),Y=Z>=2);let oe=null,he={};const be=i.getParameter(i.SCISSOR_BOX),Ge=i.getParameter(i.VIEWPORT),it=new ft().fromArray(be),ot=new ft().fromArray(Ge);function Ze(P,ie,re,fe){const ee=new Uint8Array(4),K=i.createTexture();i.bindTexture(P,K),i.texParameteri(P,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(P,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let ge=0;ge<re;ge++)P===i.TEXTURE_3D||P===i.TEXTURE_2D_ARRAY?i.texImage3D(ie,0,i.RGBA,1,1,fe,0,i.RGBA,i.UNSIGNED_BYTE,ee):i.texImage2D(ie+ge,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ee);return K}const j={};j[i.TEXTURE_2D]=Ze(i.TEXTURE_2D,i.TEXTURE_2D,1),j[i.TEXTURE_CUBE_MAP]=Ze(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),j[i.TEXTURE_2D_ARRAY]=Ze(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),j[i.TEXTURE_3D]=Ze(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),Q(i.DEPTH_TEST),a.setFunc(Ni),Pe(!1),_e(po),Q(i.CULL_FACE),lt(Bn);function Q(P){d[P]!==!0&&(i.enable(P),d[P]=!0)}function pe(P){d[P]!==!1&&(i.disable(P),d[P]=!1)}function De(P,ie){return h[P]!==ie?(i.bindFramebuffer(P,ie),h[P]=ie,P===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=ie),P===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=ie),!0):!1}function Ee(P,ie){let re=p,fe=!1;if(P){re=f.get(ie),re===void 0&&(re=[],f.set(ie,re));const ee=P.textures;if(re.length!==ee.length||re[0]!==i.COLOR_ATTACHMENT0){for(let K=0,ge=ee.length;K<ge;K++)re[K]=i.COLOR_ATTACHMENT0+K;re.length=ee.length,fe=!0}}else re[0]!==i.BACK&&(re[0]=i.BACK,fe=!0);fe&&i.drawBuffers(re)}function Xe(P){return g!==P?(i.useProgram(P),g=P,!0):!1}const Rt={[Jn]:i.FUNC_ADD,[Xc]:i.FUNC_SUBTRACT,[Yc]:i.FUNC_REVERSE_SUBTRACT};Rt[qc]=i.MIN,Rt[jc]=i.MAX;const C={[Kc]:i.ZERO,[Zc]:i.ONE,[Jc]:i.SRC_COLOR,[Jr]:i.SRC_ALPHA,[sd]:i.SRC_ALPHA_SATURATE,[nd]:i.DST_COLOR,[ed]:i.DST_ALPHA,[Qc]:i.ONE_MINUS_SRC_COLOR,[Qr]:i.ONE_MINUS_SRC_ALPHA,[id]:i.ONE_MINUS_DST_COLOR,[td]:i.ONE_MINUS_DST_ALPHA,[rd]:i.CONSTANT_COLOR,[ad]:i.ONE_MINUS_CONSTANT_COLOR,[od]:i.CONSTANT_ALPHA,[ld]:i.ONE_MINUS_CONSTANT_ALPHA};function lt(P,ie,re,fe,ee,K,ge,Ue,st,Je){if(P===Bn){_===!0&&(pe(i.BLEND),_=!1);return}if(_===!1&&(Q(i.BLEND),_=!0),P!==Wc){if(P!==m||Je!==M){if((u!==Jn||S!==Jn)&&(i.blendEquation(i.FUNC_ADD),u=Jn,S=Jn),Je)switch(P){case Di:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case mo:i.blendFunc(i.ONE,i.ONE);break;case go:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case _o:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",P);break}else switch(P){case Di:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case mo:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case go:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case _o:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",P);break}E=null,T=null,w=null,R=null,A.set(0,0,0),L=0,m=P,M=Je}return}ee=ee||ie,K=K||re,ge=ge||fe,(ie!==u||ee!==S)&&(i.blendEquationSeparate(Rt[ie],Rt[ee]),u=ie,S=ee),(re!==E||fe!==T||K!==w||ge!==R)&&(i.blendFuncSeparate(C[re],C[fe],C[K],C[ge]),E=re,T=fe,w=K,R=ge),(Ue.equals(A)===!1||st!==L)&&(i.blendColor(Ue.r,Ue.g,Ue.b,st),A.copy(Ue),L=st),m=P,M=!1}function Oe(P,ie){P.side===hn?pe(i.CULL_FACE):Q(i.CULL_FACE);let re=P.side===zt;ie&&(re=!re),Pe(re),P.blending===Di&&P.transparent===!1?lt(Bn):lt(P.blending,P.blendEquation,P.blendSrc,P.blendDst,P.blendEquationAlpha,P.blendSrcAlpha,P.blendDstAlpha,P.blendColor,P.blendAlpha,P.premultipliedAlpha),a.setFunc(P.depthFunc),a.setTest(P.depthTest),a.setMask(P.depthWrite),r.setMask(P.colorWrite);const fe=P.stencilWrite;o.setTest(fe),fe&&(o.setMask(P.stencilWriteMask),o.setFunc(P.stencilFunc,P.stencilRef,P.stencilFuncMask),o.setOp(P.stencilFail,P.stencilZFail,P.stencilZPass)),ve(P.polygonOffset,P.polygonOffsetFactor,P.polygonOffsetUnits),P.alphaToCoverage===!0?Q(i.SAMPLE_ALPHA_TO_COVERAGE):pe(i.SAMPLE_ALPHA_TO_COVERAGE)}function Pe(P){y!==P&&(P?i.frontFace(i.CW):i.frontFace(i.CCW),y=P)}function _e(P){P!==Vc?(Q(i.CULL_FACE),P!==I&&(P===po?i.cullFace(i.BACK):P===$c?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):pe(i.CULL_FACE),I=P}function ct(P){P!==N&&(Y&&i.lineWidth(P),N=P)}function ve(P,ie,re){P?(Q(i.POLYGON_OFFSET_FILL),(B!==ie||X!==re)&&(i.polygonOffset(ie,re),B=ie,X=re)):pe(i.POLYGON_OFFSET_FILL)}function ke(P){P?Q(i.SCISSOR_TEST):pe(i.SCISSOR_TEST)}function bt(P){P===void 0&&(P=i.TEXTURE0+G-1),oe!==P&&(i.activeTexture(P),oe=P)}function mt(P,ie,re){re===void 0&&(oe===null?re=i.TEXTURE0+G-1:re=oe);let fe=he[re];fe===void 0&&(fe={type:void 0,texture:void 0},he[re]=fe),(fe.type!==P||fe.texture!==ie)&&(oe!==re&&(i.activeTexture(re),oe=re),i.bindTexture(P,ie||j[P]),fe.type=P,fe.texture=ie)}function b(){const P=he[oe];P!==void 0&&P.type!==void 0&&(i.bindTexture(P.type,null),P.type=void 0,P.texture=void 0)}function v(){try{i.compressedTexImage2D(...arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function F(){try{i.compressedTexImage3D(...arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function q(){try{i.texSubImage2D(...arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function J(){try{i.texSubImage3D(...arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Se(){try{i.compressedTexSubImage3D(...arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function se(){try{i.texStorage2D(...arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function xe(){try{i.texStorage3D(...arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Me(){try{i.texImage2D(...arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function ne(){try{i.texImage3D(...arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function de(P){it.equals(P)===!1&&(i.scissor(P.x,P.y,P.z,P.w),it.copy(P))}function Ie(P){ot.equals(P)===!1&&(i.viewport(P.x,P.y,P.z,P.w),ot.copy(P))}function ye(P,ie){let re=l.get(ie);re===void 0&&(re=new WeakMap,l.set(ie,re));let fe=re.get(P);fe===void 0&&(fe=i.getUniformBlockIndex(ie,P.name),re.set(P,fe))}function le(P,ie){const fe=l.get(ie).get(P);c.get(ie)!==fe&&(i.uniformBlockBinding(ie,fe,P.__bindingPointIndex),c.set(ie,fe))}function Fe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),d={},oe=null,he={},h={},f=new WeakMap,p=[],g=null,_=!1,m=null,u=null,E=null,T=null,S=null,w=null,R=null,A=new ze(0,0,0),L=0,M=!1,y=null,I=null,N=null,B=null,X=null,it.set(0,0,i.canvas.width,i.canvas.height),ot.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:Q,disable:pe,bindFramebuffer:De,drawBuffers:Ee,useProgram:Xe,setBlending:lt,setMaterial:Oe,setFlipSided:Pe,setCullFace:_e,setLineWidth:ct,setPolygonOffset:ve,setScissorTest:ke,activeTexture:bt,bindTexture:mt,unbindTexture:b,compressedTexImage2D:v,compressedTexImage3D:F,texImage2D:Me,texImage3D:ne,updateUBOMapping:ye,uniformBlockBinding:le,texStorage2D:se,texStorage3D:xe,texSubImage2D:q,texSubImage3D:J,compressedTexSubImage2D:W,compressedTexSubImage3D:Se,scissor:de,viewport:Ie,reset:Fe}}function qm(i,e,t,n,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new qe,d=new WeakMap;let h;const f=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(b,v){return p?new OffscreenCanvas(b,v):nr("canvas")}function _(b,v,F){let q=1;const J=mt(b);if((J.width>F||J.height>F)&&(q=F/Math.max(J.width,J.height)),q<1)if(typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&b instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&b instanceof ImageBitmap||typeof VideoFrame<"u"&&b instanceof VideoFrame){const W=Math.floor(q*J.width),Se=Math.floor(q*J.height);h===void 0&&(h=g(W,Se));const se=v?g(W,Se):h;return se.width=W,se.height=Se,se.getContext("2d").drawImage(b,0,0,W,Se),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+W+"x"+Se+")."),se}else return"data"in b&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),b;return b}function m(b){return b.generateMipmaps}function u(b){i.generateMipmap(b)}function E(b){return b.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:b.isWebGL3DRenderTarget?i.TEXTURE_3D:b.isWebGLArrayRenderTarget||b.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function T(b,v,F,q,J=!1){if(b!==null){if(i[b]!==void 0)return i[b];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+b+"'")}let W=v;if(v===i.RED&&(F===i.FLOAT&&(W=i.R32F),F===i.HALF_FLOAT&&(W=i.R16F),F===i.UNSIGNED_BYTE&&(W=i.R8)),v===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(W=i.R8UI),F===i.UNSIGNED_SHORT&&(W=i.R16UI),F===i.UNSIGNED_INT&&(W=i.R32UI),F===i.BYTE&&(W=i.R8I),F===i.SHORT&&(W=i.R16I),F===i.INT&&(W=i.R32I)),v===i.RG&&(F===i.FLOAT&&(W=i.RG32F),F===i.HALF_FLOAT&&(W=i.RG16F),F===i.UNSIGNED_BYTE&&(W=i.RG8)),v===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(W=i.RG8UI),F===i.UNSIGNED_SHORT&&(W=i.RG16UI),F===i.UNSIGNED_INT&&(W=i.RG32UI),F===i.BYTE&&(W=i.RG8I),F===i.SHORT&&(W=i.RG16I),F===i.INT&&(W=i.RG32I)),v===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(W=i.RGB8UI),F===i.UNSIGNED_SHORT&&(W=i.RGB16UI),F===i.UNSIGNED_INT&&(W=i.RGB32UI),F===i.BYTE&&(W=i.RGB8I),F===i.SHORT&&(W=i.RGB16I),F===i.INT&&(W=i.RGB32I)),v===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(W=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(W=i.RGBA16UI),F===i.UNSIGNED_INT&&(W=i.RGBA32UI),F===i.BYTE&&(W=i.RGBA8I),F===i.SHORT&&(W=i.RGBA16I),F===i.INT&&(W=i.RGBA32I)),v===i.RGB&&(F===i.UNSIGNED_INT_5_9_9_9_REV&&(W=i.RGB9_E5),F===i.UNSIGNED_INT_10F_11F_11F_REV&&(W=i.R11F_G11F_B10F)),v===i.RGBA){const Se=J?Qs:Ke.getTransfer(q);F===i.FLOAT&&(W=i.RGBA32F),F===i.HALF_FLOAT&&(W=i.RGBA16F),F===i.UNSIGNED_BYTE&&(W=Se===et?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT_4_4_4_4&&(W=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(W=i.RGB5_A1)}return(W===i.R16F||W===i.R32F||W===i.RG16F||W===i.RG32F||W===i.RGBA16F||W===i.RGBA32F)&&e.get("EXT_color_buffer_float"),W}function S(b,v){let F;return b?v===null||v===ri||v===is?F=i.DEPTH24_STENCIL8:v===fn?F=i.DEPTH32F_STENCIL8:v===ns&&(F=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===ri||v===is?F=i.DEPTH_COMPONENT24:v===fn?F=i.DEPTH_COMPONENT32F:v===ns&&(F=i.DEPTH_COMPONENT16),F}function w(b,v){return m(b)===!0||b.isFramebufferTexture&&b.minFilter!==qt&&b.minFilter!==un?Math.log2(Math.max(v.width,v.height))+1:b.mipmaps!==void 0&&b.mipmaps.length>0?b.mipmaps.length:b.isCompressedTexture&&Array.isArray(b.image)?v.mipmaps.length:1}function R(b){const v=b.target;v.removeEventListener("dispose",R),L(v),v.isVideoTexture&&d.delete(v)}function A(b){const v=b.target;v.removeEventListener("dispose",A),y(v)}function L(b){const v=n.get(b);if(v.__webglInit===void 0)return;const F=b.source,q=f.get(F);if(q){const J=q[v.__cacheKey];J.usedTimes--,J.usedTimes===0&&M(b),Object.keys(q).length===0&&f.delete(F)}n.remove(b)}function M(b){const v=n.get(b);i.deleteTexture(v.__webglTexture);const F=b.source,q=f.get(F);delete q[v.__cacheKey],a.memory.textures--}function y(b){const v=n.get(b);if(b.depthTexture&&(b.depthTexture.dispose(),n.remove(b.depthTexture)),b.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(v.__webglFramebuffer[q]))for(let J=0;J<v.__webglFramebuffer[q].length;J++)i.deleteFramebuffer(v.__webglFramebuffer[q][J]);else i.deleteFramebuffer(v.__webglFramebuffer[q]);v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer[q])}else{if(Array.isArray(v.__webglFramebuffer))for(let q=0;q<v.__webglFramebuffer.length;q++)i.deleteFramebuffer(v.__webglFramebuffer[q]);else i.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&i.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let q=0;q<v.__webglColorRenderbuffer.length;q++)v.__webglColorRenderbuffer[q]&&i.deleteRenderbuffer(v.__webglColorRenderbuffer[q]);v.__webglDepthRenderbuffer&&i.deleteRenderbuffer(v.__webglDepthRenderbuffer)}const F=b.textures;for(let q=0,J=F.length;q<J;q++){const W=n.get(F[q]);W.__webglTexture&&(i.deleteTexture(W.__webglTexture),a.memory.textures--),n.remove(F[q])}n.remove(b)}let I=0;function N(){I=0}function B(){const b=I;return b>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+b+" texture units while this GPU supports only "+s.maxTextures),I+=1,b}function X(b){const v=[];return v.push(b.wrapS),v.push(b.wrapT),v.push(b.wrapR||0),v.push(b.magFilter),v.push(b.minFilter),v.push(b.anisotropy),v.push(b.internalFormat),v.push(b.format),v.push(b.type),v.push(b.generateMipmaps),v.push(b.premultiplyAlpha),v.push(b.flipY),v.push(b.unpackAlignment),v.push(b.colorSpace),v.join()}function G(b,v){const F=n.get(b);if(b.isVideoTexture&&ke(b),b.isRenderTargetTexture===!1&&b.isExternalTexture!==!0&&b.version>0&&F.__version!==b.version){const q=b.image;if(q===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{j(F,b,v);return}}else b.isExternalTexture&&(F.__webglTexture=b.sourceTexture?b.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+v)}function Y(b,v){const F=n.get(b);if(b.isRenderTargetTexture===!1&&b.version>0&&F.__version!==b.version){j(F,b,v);return}t.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+v)}function Z(b,v){const F=n.get(b);if(b.isRenderTargetTexture===!1&&b.version>0&&F.__version!==b.version){j(F,b,v);return}t.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+v)}function $(b,v){const F=n.get(b);if(b.version>0&&F.__version!==b.version){Q(F,b,v);return}t.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+v)}const oe={[ca]:i.REPEAT,[ti]:i.CLAMP_TO_EDGE,[da]:i.MIRRORED_REPEAT},he={[qt]:i.NEAREST,[_d]:i.NEAREST_MIPMAP_NEAREST,[ps]:i.NEAREST_MIPMAP_LINEAR,[un]:i.LINEAR,[vr]:i.LINEAR_MIPMAP_NEAREST,[ni]:i.LINEAR_MIPMAP_LINEAR},be={[yd]:i.NEVER,[wd]:i.ALWAYS,[Sd]:i.LESS,[ql]:i.LEQUAL,[Ed]:i.EQUAL,[Ad]:i.GEQUAL,[bd]:i.GREATER,[Td]:i.NOTEQUAL};function Ge(b,v){if(v.type===fn&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===un||v.magFilter===vr||v.magFilter===ps||v.magFilter===ni||v.minFilter===un||v.minFilter===vr||v.minFilter===ps||v.minFilter===ni)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(b,i.TEXTURE_WRAP_S,oe[v.wrapS]),i.texParameteri(b,i.TEXTURE_WRAP_T,oe[v.wrapT]),(b===i.TEXTURE_3D||b===i.TEXTURE_2D_ARRAY)&&i.texParameteri(b,i.TEXTURE_WRAP_R,oe[v.wrapR]),i.texParameteri(b,i.TEXTURE_MAG_FILTER,he[v.magFilter]),i.texParameteri(b,i.TEXTURE_MIN_FILTER,he[v.minFilter]),v.compareFunction&&(i.texParameteri(b,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(b,i.TEXTURE_COMPARE_FUNC,be[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===qt||v.minFilter!==ps&&v.minFilter!==ni||v.type===fn&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||n.get(v).__currentAnisotropy){const F=e.get("EXT_texture_filter_anisotropic");i.texParameterf(b,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy}}}function it(b,v){let F=!1;b.__webglInit===void 0&&(b.__webglInit=!0,v.addEventListener("dispose",R));const q=v.source;let J=f.get(q);J===void 0&&(J={},f.set(q,J));const W=X(v);if(W!==b.__cacheKey){J[W]===void 0&&(J[W]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,F=!0),J[W].usedTimes++;const Se=J[b.__cacheKey];Se!==void 0&&(J[b.__cacheKey].usedTimes--,Se.usedTimes===0&&M(v)),b.__cacheKey=W,b.__webglTexture=J[W].texture}return F}function ot(b,v,F){return Math.floor(Math.floor(b/F)/v)}function Ze(b,v,F,q){const W=b.updateRanges;if(W.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,v.width,v.height,F,q,v.data);else{W.sort((ne,de)=>ne.start-de.start);let Se=0;for(let ne=1;ne<W.length;ne++){const de=W[Se],Ie=W[ne],ye=de.start+de.count,le=ot(Ie.start,v.width,4),Fe=ot(de.start,v.width,4);Ie.start<=ye+1&&le===Fe&&ot(Ie.start+Ie.count-1,v.width,4)===le?de.count=Math.max(de.count,Ie.start+Ie.count-de.start):(++Se,W[Se]=Ie)}W.length=Se+1;const se=i.getParameter(i.UNPACK_ROW_LENGTH),xe=i.getParameter(i.UNPACK_SKIP_PIXELS),Me=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,v.width);for(let ne=0,de=W.length;ne<de;ne++){const Ie=W[ne],ye=Math.floor(Ie.start/4),le=Math.ceil(Ie.count/4),Fe=ye%v.width,P=Math.floor(ye/v.width),ie=le,re=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,Fe),i.pixelStorei(i.UNPACK_SKIP_ROWS,P),t.texSubImage2D(i.TEXTURE_2D,0,Fe,P,ie,re,F,q,v.data)}b.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,se),i.pixelStorei(i.UNPACK_SKIP_PIXELS,xe),i.pixelStorei(i.UNPACK_SKIP_ROWS,Me)}}function j(b,v,F){let q=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(q=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(q=i.TEXTURE_3D);const J=it(b,v),W=v.source;t.bindTexture(q,b.__webglTexture,i.TEXTURE0+F);const Se=n.get(W);if(W.version!==Se.__version||J===!0){t.activeTexture(i.TEXTURE0+F);const se=Ke.getPrimaries(Ke.workingColorSpace),xe=v.colorSpace===On?null:Ke.getPrimaries(v.colorSpace),Me=v.colorSpace===On||se===xe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Me);let ne=_(v.image,!1,s.maxTextureSize);ne=bt(v,ne);const de=r.convert(v.format,v.colorSpace),Ie=r.convert(v.type);let ye=T(v.internalFormat,de,Ie,v.colorSpace,v.isVideoTexture);Ge(q,v);let le;const Fe=v.mipmaps,P=v.isVideoTexture!==!0,ie=Se.__version===void 0||J===!0,re=W.dataReady,fe=w(v,ne);if(v.isDepthTexture)ye=S(v.format===rs,v.type),ie&&(P?t.texStorage2D(i.TEXTURE_2D,1,ye,ne.width,ne.height):t.texImage2D(i.TEXTURE_2D,0,ye,ne.width,ne.height,0,de,Ie,null));else if(v.isDataTexture)if(Fe.length>0){P&&ie&&t.texStorage2D(i.TEXTURE_2D,fe,ye,Fe[0].width,Fe[0].height);for(let ee=0,K=Fe.length;ee<K;ee++)le=Fe[ee],P?re&&t.texSubImage2D(i.TEXTURE_2D,ee,0,0,le.width,le.height,de,Ie,le.data):t.texImage2D(i.TEXTURE_2D,ee,ye,le.width,le.height,0,de,Ie,le.data);v.generateMipmaps=!1}else P?(ie&&t.texStorage2D(i.TEXTURE_2D,fe,ye,ne.width,ne.height),re&&Ze(v,ne,de,Ie)):t.texImage2D(i.TEXTURE_2D,0,ye,ne.width,ne.height,0,de,Ie,ne.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){P&&ie&&t.texStorage3D(i.TEXTURE_2D_ARRAY,fe,ye,Fe[0].width,Fe[0].height,ne.depth);for(let ee=0,K=Fe.length;ee<K;ee++)if(le=Fe[ee],v.format!==on)if(de!==null)if(P){if(re)if(v.layerUpdates.size>0){const ge=qo(le.width,le.height,v.format,v.type);for(const Ue of v.layerUpdates){const st=le.data.subarray(Ue*ge/le.data.BYTES_PER_ELEMENT,(Ue+1)*ge/le.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ee,0,0,Ue,le.width,le.height,1,de,st)}v.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ee,0,0,0,le.width,le.height,ne.depth,de,le.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ee,ye,le.width,le.height,ne.depth,0,le.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else P?re&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ee,0,0,0,le.width,le.height,ne.depth,de,Ie,le.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ee,ye,le.width,le.height,ne.depth,0,de,Ie,le.data)}else{P&&ie&&t.texStorage2D(i.TEXTURE_2D,fe,ye,Fe[0].width,Fe[0].height);for(let ee=0,K=Fe.length;ee<K;ee++)le=Fe[ee],v.format!==on?de!==null?P?re&&t.compressedTexSubImage2D(i.TEXTURE_2D,ee,0,0,le.width,le.height,de,le.data):t.compressedTexImage2D(i.TEXTURE_2D,ee,ye,le.width,le.height,0,le.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):P?re&&t.texSubImage2D(i.TEXTURE_2D,ee,0,0,le.width,le.height,de,Ie,le.data):t.texImage2D(i.TEXTURE_2D,ee,ye,le.width,le.height,0,de,Ie,le.data)}else if(v.isDataArrayTexture)if(P){if(ie&&t.texStorage3D(i.TEXTURE_2D_ARRAY,fe,ye,ne.width,ne.height,ne.depth),re)if(v.layerUpdates.size>0){const ee=qo(ne.width,ne.height,v.format,v.type);for(const K of v.layerUpdates){const ge=ne.data.subarray(K*ee/ne.data.BYTES_PER_ELEMENT,(K+1)*ee/ne.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,K,ne.width,ne.height,1,de,Ie,ge)}v.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,de,Ie,ne.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,ye,ne.width,ne.height,ne.depth,0,de,Ie,ne.data);else if(v.isData3DTexture)P?(ie&&t.texStorage3D(i.TEXTURE_3D,fe,ye,ne.width,ne.height,ne.depth),re&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,de,Ie,ne.data)):t.texImage3D(i.TEXTURE_3D,0,ye,ne.width,ne.height,ne.depth,0,de,Ie,ne.data);else if(v.isFramebufferTexture){if(ie)if(P)t.texStorage2D(i.TEXTURE_2D,fe,ye,ne.width,ne.height);else{let ee=ne.width,K=ne.height;for(let ge=0;ge<fe;ge++)t.texImage2D(i.TEXTURE_2D,ge,ye,ee,K,0,de,Ie,null),ee>>=1,K>>=1}}else if(Fe.length>0){if(P&&ie){const ee=mt(Fe[0]);t.texStorage2D(i.TEXTURE_2D,fe,ye,ee.width,ee.height)}for(let ee=0,K=Fe.length;ee<K;ee++)le=Fe[ee],P?re&&t.texSubImage2D(i.TEXTURE_2D,ee,0,0,de,Ie,le):t.texImage2D(i.TEXTURE_2D,ee,ye,de,Ie,le);v.generateMipmaps=!1}else if(P){if(ie){const ee=mt(ne);t.texStorage2D(i.TEXTURE_2D,fe,ye,ee.width,ee.height)}re&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,de,Ie,ne)}else t.texImage2D(i.TEXTURE_2D,0,ye,de,Ie,ne);m(v)&&u(q),Se.__version=W.version,v.onUpdate&&v.onUpdate(v)}b.__version=v.version}function Q(b,v,F){if(v.image.length!==6)return;const q=it(b,v),J=v.source;t.bindTexture(i.TEXTURE_CUBE_MAP,b.__webglTexture,i.TEXTURE0+F);const W=n.get(J);if(J.version!==W.__version||q===!0){t.activeTexture(i.TEXTURE0+F);const Se=Ke.getPrimaries(Ke.workingColorSpace),se=v.colorSpace===On?null:Ke.getPrimaries(v.colorSpace),xe=v.colorSpace===On||Se===se?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe);const Me=v.isCompressedTexture||v.image[0].isCompressedTexture,ne=v.image[0]&&v.image[0].isDataTexture,de=[];for(let K=0;K<6;K++)!Me&&!ne?de[K]=_(v.image[K],!0,s.maxCubemapSize):de[K]=ne?v.image[K].image:v.image[K],de[K]=bt(v,de[K]);const Ie=de[0],ye=r.convert(v.format,v.colorSpace),le=r.convert(v.type),Fe=T(v.internalFormat,ye,le,v.colorSpace),P=v.isVideoTexture!==!0,ie=W.__version===void 0||q===!0,re=J.dataReady;let fe=w(v,Ie);Ge(i.TEXTURE_CUBE_MAP,v);let ee;if(Me){P&&ie&&t.texStorage2D(i.TEXTURE_CUBE_MAP,fe,Fe,Ie.width,Ie.height);for(let K=0;K<6;K++){ee=de[K].mipmaps;for(let ge=0;ge<ee.length;ge++){const Ue=ee[ge];v.format!==on?ye!==null?P?re&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge,0,0,Ue.width,Ue.height,ye,Ue.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge,Fe,Ue.width,Ue.height,0,Ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):P?re&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge,0,0,Ue.width,Ue.height,ye,le,Ue.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge,Fe,Ue.width,Ue.height,0,ye,le,Ue.data)}}}else{if(ee=v.mipmaps,P&&ie){ee.length>0&&fe++;const K=mt(de[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,fe,Fe,K.width,K.height)}for(let K=0;K<6;K++)if(ne){P?re&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,de[K].width,de[K].height,ye,le,de[K].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Fe,de[K].width,de[K].height,0,ye,le,de[K].data);for(let ge=0;ge<ee.length;ge++){const st=ee[ge].image[K].image;P?re&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge+1,0,0,st.width,st.height,ye,le,st.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge+1,Fe,st.width,st.height,0,ye,le,st.data)}}else{P?re&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,ye,le,de[K]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Fe,ye,le,de[K]);for(let ge=0;ge<ee.length;ge++){const Ue=ee[ge];P?re&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge+1,0,0,ye,le,Ue.image[K]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge+1,Fe,ye,le,Ue.image[K])}}}m(v)&&u(i.TEXTURE_CUBE_MAP),W.__version=J.version,v.onUpdate&&v.onUpdate(v)}b.__version=v.version}function pe(b,v,F,q,J,W){const Se=r.convert(F.format,F.colorSpace),se=r.convert(F.type),xe=T(F.internalFormat,Se,se,F.colorSpace),Me=n.get(v),ne=n.get(F);if(ne.__renderTarget=v,!Me.__hasExternalTextures){const de=Math.max(1,v.width>>W),Ie=Math.max(1,v.height>>W);J===i.TEXTURE_3D||J===i.TEXTURE_2D_ARRAY?t.texImage3D(J,W,xe,de,Ie,v.depth,0,Se,se,null):t.texImage2D(J,W,xe,de,Ie,0,Se,se,null)}t.bindFramebuffer(i.FRAMEBUFFER,b),ve(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,q,J,ne.__webglTexture,0,ct(v)):(J===i.TEXTURE_2D||J>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,q,J,ne.__webglTexture,W),t.bindFramebuffer(i.FRAMEBUFFER,null)}function De(b,v,F){if(i.bindRenderbuffer(i.RENDERBUFFER,b),v.depthBuffer){const q=v.depthTexture,J=q&&q.isDepthTexture?q.type:null,W=S(v.stencilBuffer,J),Se=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,se=ct(v);ve(v)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,se,W,v.width,v.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,se,W,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,W,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Se,i.RENDERBUFFER,b)}else{const q=v.textures;for(let J=0;J<q.length;J++){const W=q[J],Se=r.convert(W.format,W.colorSpace),se=r.convert(W.type),xe=T(W.internalFormat,Se,se,W.colorSpace),Me=ct(v);F&&ve(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Me,xe,v.width,v.height):ve(v)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Me,xe,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,xe,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ee(b,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,b),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const q=n.get(v.depthTexture);q.__renderTarget=v,(!q.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),G(v.depthTexture,0);const J=q.__webglTexture,W=ct(v);if(v.depthTexture.format===ss)ve(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,J,0,W):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,J,0);else if(v.depthTexture.format===rs)ve(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,J,0,W):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,J,0);else throw new Error("Unknown depthTexture format")}function Xe(b){const v=n.get(b),F=b.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==b.depthTexture){const q=b.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),q){const J=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,q.removeEventListener("dispose",J)};q.addEventListener("dispose",J),v.__depthDisposeCallback=J}v.__boundDepthTexture=q}if(b.depthTexture&&!v.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");const q=b.texture.mipmaps;q&&q.length>0?Ee(v.__webglFramebuffer[0],b):Ee(v.__webglFramebuffer,b)}else if(F){v.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[q]),v.__webglDepthbuffer[q]===void 0)v.__webglDepthbuffer[q]=i.createRenderbuffer(),De(v.__webglDepthbuffer[q],b,!1);else{const J=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,W=v.__webglDepthbuffer[q];i.bindRenderbuffer(i.RENDERBUFFER,W),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,W)}}else{const q=b.texture.mipmaps;if(q&&q.length>0?t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=i.createRenderbuffer(),De(v.__webglDepthbuffer,b,!1);else{const J=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,W=v.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,W),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,W)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Rt(b,v,F){const q=n.get(b);v!==void 0&&pe(q.__webglFramebuffer,b,b.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&Xe(b)}function C(b){const v=b.texture,F=n.get(b),q=n.get(v);b.addEventListener("dispose",A);const J=b.textures,W=b.isWebGLCubeRenderTarget===!0,Se=J.length>1;if(Se||(q.__webglTexture===void 0&&(q.__webglTexture=i.createTexture()),q.__version=v.version,a.memory.textures++),W){F.__webglFramebuffer=[];for(let se=0;se<6;se++)if(v.mipmaps&&v.mipmaps.length>0){F.__webglFramebuffer[se]=[];for(let xe=0;xe<v.mipmaps.length;xe++)F.__webglFramebuffer[se][xe]=i.createFramebuffer()}else F.__webglFramebuffer[se]=i.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){F.__webglFramebuffer=[];for(let se=0;se<v.mipmaps.length;se++)F.__webglFramebuffer[se]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(Se)for(let se=0,xe=J.length;se<xe;se++){const Me=n.get(J[se]);Me.__webglTexture===void 0&&(Me.__webglTexture=i.createTexture(),a.memory.textures++)}if(b.samples>0&&ve(b)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let se=0;se<J.length;se++){const xe=J[se];F.__webglColorRenderbuffer[se]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[se]);const Me=r.convert(xe.format,xe.colorSpace),ne=r.convert(xe.type),de=T(xe.internalFormat,Me,ne,xe.colorSpace,b.isXRRenderTarget===!0),Ie=ct(b);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ie,de,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+se,i.RENDERBUFFER,F.__webglColorRenderbuffer[se])}i.bindRenderbuffer(i.RENDERBUFFER,null),b.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),De(F.__webglDepthRenderbuffer,b,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(W){t.bindTexture(i.TEXTURE_CUBE_MAP,q.__webglTexture),Ge(i.TEXTURE_CUBE_MAP,v);for(let se=0;se<6;se++)if(v.mipmaps&&v.mipmaps.length>0)for(let xe=0;xe<v.mipmaps.length;xe++)pe(F.__webglFramebuffer[se][xe],b,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+se,xe);else pe(F.__webglFramebuffer[se],b,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0);m(v)&&u(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Se){for(let se=0,xe=J.length;se<xe;se++){const Me=J[se],ne=n.get(Me);let de=i.TEXTURE_2D;(b.isWebGL3DRenderTarget||b.isWebGLArrayRenderTarget)&&(de=b.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(de,ne.__webglTexture),Ge(de,Me),pe(F.__webglFramebuffer,b,Me,i.COLOR_ATTACHMENT0+se,de,0),m(Me)&&u(de)}t.unbindTexture()}else{let se=i.TEXTURE_2D;if((b.isWebGL3DRenderTarget||b.isWebGLArrayRenderTarget)&&(se=b.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(se,q.__webglTexture),Ge(se,v),v.mipmaps&&v.mipmaps.length>0)for(let xe=0;xe<v.mipmaps.length;xe++)pe(F.__webglFramebuffer[xe],b,v,i.COLOR_ATTACHMENT0,se,xe);else pe(F.__webglFramebuffer,b,v,i.COLOR_ATTACHMENT0,se,0);m(v)&&u(se),t.unbindTexture()}b.depthBuffer&&Xe(b)}function lt(b){const v=b.textures;for(let F=0,q=v.length;F<q;F++){const J=v[F];if(m(J)){const W=E(b),Se=n.get(J).__webglTexture;t.bindTexture(W,Se),u(W),t.unbindTexture()}}}const Oe=[],Pe=[];function _e(b){if(b.samples>0){if(ve(b)===!1){const v=b.textures,F=b.width,q=b.height;let J=i.COLOR_BUFFER_BIT;const W=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Se=n.get(b),se=v.length>1;if(se)for(let Me=0;Me<v.length;Me++)t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Me,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Me,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Se.__webglMultisampledFramebuffer);const xe=b.texture.mipmaps;xe&&xe.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Se.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Se.__webglFramebuffer);for(let Me=0;Me<v.length;Me++){if(b.resolveDepthBuffer&&(b.depthBuffer&&(J|=i.DEPTH_BUFFER_BIT),b.stencilBuffer&&b.resolveStencilBuffer&&(J|=i.STENCIL_BUFFER_BIT)),se){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Se.__webglColorRenderbuffer[Me]);const ne=n.get(v[Me]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ne,0)}i.blitFramebuffer(0,0,F,q,0,0,F,q,J,i.NEAREST),c===!0&&(Oe.length=0,Pe.length=0,Oe.push(i.COLOR_ATTACHMENT0+Me),b.depthBuffer&&b.resolveDepthBuffer===!1&&(Oe.push(W),Pe.push(W),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Pe)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Oe))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),se)for(let Me=0;Me<v.length;Me++){t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Me,i.RENDERBUFFER,Se.__webglColorRenderbuffer[Me]);const ne=n.get(v[Me]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Me,i.TEXTURE_2D,ne,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Se.__webglMultisampledFramebuffer)}else if(b.depthBuffer&&b.resolveDepthBuffer===!1&&c){const v=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[v])}}}function ct(b){return Math.min(s.maxSamples,b.samples)}function ve(b){const v=n.get(b);return b.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function ke(b){const v=a.render.frame;d.get(b)!==v&&(d.set(b,v),b.update())}function bt(b,v){const F=b.colorSpace,q=b.format,J=b.type;return b.isCompressedTexture===!0||b.isVideoTexture===!0||F!==Bi&&F!==On&&(Ke.getTransfer(F)===et?(q!==on||J!==mn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),v}function mt(b){return typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement?(l.width=b.naturalWidth||b.width,l.height=b.naturalHeight||b.height):typeof VideoFrame<"u"&&b instanceof VideoFrame?(l.width=b.displayWidth,l.height=b.displayHeight):(l.width=b.width,l.height=b.height),l}this.allocateTextureUnit=B,this.resetTextureUnits=N,this.setTexture2D=G,this.setTexture2DArray=Y,this.setTexture3D=Z,this.setTextureCube=$,this.rebindTextures=Rt,this.setupRenderTarget=C,this.updateRenderTargetMipmap=lt,this.updateMultisampleRenderTarget=_e,this.setupDepthRenderbuffer=Xe,this.setupFrameBufferTexture=pe,this.useMultisampledRTT=ve}function jm(i,e){function t(n,s=On){let r;const a=Ke.getTransfer(s);if(n===mn)return i.UNSIGNED_BYTE;if(n===$a)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Wa)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Gl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Vl)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Hl)return i.BYTE;if(n===zl)return i.SHORT;if(n===ns)return i.UNSIGNED_SHORT;if(n===Va)return i.INT;if(n===ri)return i.UNSIGNED_INT;if(n===fn)return i.FLOAT;if(n===ls)return i.HALF_FLOAT;if(n===$l)return i.ALPHA;if(n===Wl)return i.RGB;if(n===on)return i.RGBA;if(n===ss)return i.DEPTH_COMPONENT;if(n===rs)return i.DEPTH_STENCIL;if(n===Xa)return i.RED;if(n===Ya)return i.RED_INTEGER;if(n===Xl)return i.RG;if(n===qa)return i.RG_INTEGER;if(n===ja)return i.RGBA_INTEGER;if(n===Ws||n===Xs||n===Ys||n===qs)if(a===et)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ws)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Xs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ys)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===qs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ws)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Xs)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ys)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===qs)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ha||n===ua||n===fa||n===pa)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===ha)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ua)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===fa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===pa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ma||n===ga||n===_a)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ma||n===ga)return a===et?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===_a)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===va||n===xa||n===Ma||n===ya||n===Sa||n===Ea||n===ba||n===Ta||n===Aa||n===wa||n===Ra||n===Ca||n===Ia||n===Pa)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===va)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===xa)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ma)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===ya)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Sa)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ea)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===ba)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ta)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Aa)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===wa)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ra)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ca)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ia)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Pa)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===La||n===Da||n===Ua)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===La)return a===et?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Da)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ua)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Na||n===Oa||n===Fa||n===Ba)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Na)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Oa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Fa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ba)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===is?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const Km=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Zm=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Jm{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new oc(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new zn({vertexShader:Km,fragmentShader:Zm,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ne(new si(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Qm extends Gi{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",c=1,l=null,d=null,h=null,f=null,p=null,g=null;const _=typeof XRWebGLBinding<"u",m=new Jm,u={},E=t.getContextAttributes();let T=null,S=null;const w=[],R=[],A=new qe;let L=null;const M=new Yt;M.viewport=new ft;const y=new Yt;y.viewport=new ft;const I=[M,y],N=new xh;let B=null,X=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let Q=w[j];return Q===void 0&&(Q=new Hr,w[j]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(j){let Q=w[j];return Q===void 0&&(Q=new Hr,w[j]=Q),Q.getGripSpace()},this.getHand=function(j){let Q=w[j];return Q===void 0&&(Q=new Hr,w[j]=Q),Q.getHandSpace()};function G(j){const Q=R.indexOf(j.inputSource);if(Q===-1)return;const pe=w[Q];pe!==void 0&&(pe.update(j.inputSource,j.frame,l||a),pe.dispatchEvent({type:j.type,data:j.inputSource}))}function Y(){s.removeEventListener("select",G),s.removeEventListener("selectstart",G),s.removeEventListener("selectend",G),s.removeEventListener("squeeze",G),s.removeEventListener("squeezestart",G),s.removeEventListener("squeezeend",G),s.removeEventListener("end",Y),s.removeEventListener("inputsourceschange",Z);for(let j=0;j<w.length;j++){const Q=R[j];Q!==null&&(R[j]=null,w[j].disconnect(Q))}B=null,X=null,m.reset();for(const j in u)delete u[j];e.setRenderTarget(T),p=null,f=null,h=null,s=null,S=null,Ze.stop(),n.isPresenting=!1,e.setPixelRatio(L),e.setSize(A.width,A.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){r=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){o=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(j){l=j},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return h===null&&_&&(h=new XRWebGLBinding(s,t)),h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(j){if(s=j,s!==null){if(T=e.getRenderTarget(),s.addEventListener("select",G),s.addEventListener("selectstart",G),s.addEventListener("selectend",G),s.addEventListener("squeeze",G),s.addEventListener("squeezestart",G),s.addEventListener("squeezeend",G),s.addEventListener("end",Y),s.addEventListener("inputsourceschange",Z),E.xrCompatible!==!0&&await t.makeXRCompatible(),L=e.getPixelRatio(),e.getSize(A),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let pe=null,De=null,Ee=null;E.depth&&(Ee=E.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,pe=E.stencil?rs:ss,De=E.stencil?is:ri);const Xe={colorFormat:t.RGBA8,depthFormat:Ee,scaleFactor:r};h=this.getBinding(),f=h.createProjectionLayer(Xe),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new ai(f.textureWidth,f.textureHeight,{format:on,type:mn,depthTexture:new ac(f.textureWidth,f.textureHeight,De,void 0,void 0,void 0,void 0,void 0,void 0,pe),stencilBuffer:E.stencil,colorSpace:e.outputColorSpace,samples:E.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{const pe={antialias:E.antialias,alpha:!0,depth:E.depth,stencil:E.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,pe),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new ai(p.framebufferWidth,p.framebufferHeight,{format:on,type:mn,colorSpace:e.outputColorSpace,stencilBuffer:E.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),Ze.setContext(s),Ze.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function Z(j){for(let Q=0;Q<j.removed.length;Q++){const pe=j.removed[Q],De=R.indexOf(pe);De>=0&&(R[De]=null,w[De].disconnect(pe))}for(let Q=0;Q<j.added.length;Q++){const pe=j.added[Q];let De=R.indexOf(pe);if(De===-1){for(let Xe=0;Xe<w.length;Xe++)if(Xe>=R.length){R.push(pe),De=Xe;break}else if(R[Xe]===null){R[Xe]=pe,De=Xe;break}if(De===-1)break}const Ee=w[De];Ee&&Ee.connect(pe)}}const $=new O,oe=new O;function he(j,Q,pe){$.setFromMatrixPosition(Q.matrixWorld),oe.setFromMatrixPosition(pe.matrixWorld);const De=$.distanceTo(oe),Ee=Q.projectionMatrix.elements,Xe=pe.projectionMatrix.elements,Rt=Ee[14]/(Ee[10]-1),C=Ee[14]/(Ee[10]+1),lt=(Ee[9]+1)/Ee[5],Oe=(Ee[9]-1)/Ee[5],Pe=(Ee[8]-1)/Ee[0],_e=(Xe[8]+1)/Xe[0],ct=Rt*Pe,ve=Rt*_e,ke=De/(-Pe+_e),bt=ke*-Pe;if(Q.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(bt),j.translateZ(ke),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),Ee[10]===-1)j.projectionMatrix.copy(Q.projectionMatrix),j.projectionMatrixInverse.copy(Q.projectionMatrixInverse);else{const mt=Rt+ke,b=C+ke,v=ct-bt,F=ve+(De-bt),q=lt*C/b*mt,J=Oe*C/b*mt;j.projectionMatrix.makePerspective(v,F,q,J,mt,b),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function be(j,Q){Q===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(Q.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(s===null)return;let Q=j.near,pe=j.far;m.texture!==null&&(m.depthNear>0&&(Q=m.depthNear),m.depthFar>0&&(pe=m.depthFar)),N.near=y.near=M.near=Q,N.far=y.far=M.far=pe,(B!==N.near||X!==N.far)&&(s.updateRenderState({depthNear:N.near,depthFar:N.far}),B=N.near,X=N.far),N.layers.mask=j.layers.mask|6,M.layers.mask=N.layers.mask&3,y.layers.mask=N.layers.mask&5;const De=j.parent,Ee=N.cameras;be(N,De);for(let Xe=0;Xe<Ee.length;Xe++)be(Ee[Xe],De);Ee.length===2?he(N,M,y):N.projectionMatrix.copy(M.projectionMatrix),Ge(j,N,De)};function Ge(j,Q,pe){pe===null?j.matrix.copy(Q.matrixWorld):(j.matrix.copy(pe.matrixWorld),j.matrix.invert(),j.matrix.multiply(Q.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(Q.projectionMatrix),j.projectionMatrixInverse.copy(Q.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=tr*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return N},this.getFoveation=function(){if(!(f===null&&p===null))return c},this.setFoveation=function(j){c=j,f!==null&&(f.fixedFoveation=j),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=j)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(N)},this.getCameraTexture=function(j){return u[j]};let it=null;function ot(j,Q){if(d=Q.getViewerPose(l||a),g=Q,d!==null){const pe=d.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let De=!1;pe.length!==N.cameras.length&&(N.cameras.length=0,De=!0);for(let C=0;C<pe.length;C++){const lt=pe[C];let Oe=null;if(p!==null)Oe=p.getViewport(lt);else{const _e=h.getViewSubImage(f,lt);Oe=_e.viewport,C===0&&(e.setRenderTargetTextures(S,_e.colorTexture,_e.depthStencilTexture),e.setRenderTarget(S))}let Pe=I[C];Pe===void 0&&(Pe=new Yt,Pe.layers.enable(C),Pe.viewport=new ft,I[C]=Pe),Pe.matrix.fromArray(lt.transform.matrix),Pe.matrix.decompose(Pe.position,Pe.quaternion,Pe.scale),Pe.projectionMatrix.fromArray(lt.projectionMatrix),Pe.projectionMatrixInverse.copy(Pe.projectionMatrix).invert(),Pe.viewport.set(Oe.x,Oe.y,Oe.width,Oe.height),C===0&&(N.matrix.copy(Pe.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale)),De===!0&&N.cameras.push(Pe)}const Ee=s.enabledFeatures;if(Ee&&Ee.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){h=n.getBinding();const C=h.getDepthInformation(pe[0]);C&&C.isValid&&C.texture&&m.init(C,s.renderState)}if(Ee&&Ee.includes("camera-access")&&_){e.state.unbindTexture(),h=n.getBinding();for(let C=0;C<pe.length;C++){const lt=pe[C].camera;if(lt){let Oe=u[lt];Oe||(Oe=new oc,u[lt]=Oe);const Pe=h.getCameraImage(lt);Oe.sourceTexture=Pe}}}}for(let pe=0;pe<w.length;pe++){const De=R[pe],Ee=w[pe];De!==null&&Ee!==void 0&&Ee.update(De,Q,l||a)}it&&it(j,Q),Q.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Q}),g=null}const Ze=new dc;Ze.setAnimationLoop(ot),this.setAnimationLoop=function(j){it=j},this.dispose=function(){}}}const jn=new gn,eg=new at;function tg(i,e){function t(m,u){m.matrixAutoUpdate===!0&&m.updateMatrix(),u.value.copy(m.matrix)}function n(m,u){u.color.getRGB(m.fogColor.value,nc(i)),u.isFog?(m.fogNear.value=u.near,m.fogFar.value=u.far):u.isFogExp2&&(m.fogDensity.value=u.density)}function s(m,u,E,T,S){u.isMeshBasicMaterial||u.isMeshLambertMaterial?r(m,u):u.isMeshToonMaterial?(r(m,u),h(m,u)):u.isMeshPhongMaterial?(r(m,u),d(m,u)):u.isMeshStandardMaterial?(r(m,u),f(m,u),u.isMeshPhysicalMaterial&&p(m,u,S)):u.isMeshMatcapMaterial?(r(m,u),g(m,u)):u.isMeshDepthMaterial?r(m,u):u.isMeshDistanceMaterial?(r(m,u),_(m,u)):u.isMeshNormalMaterial?r(m,u):u.isLineBasicMaterial?(a(m,u),u.isLineDashedMaterial&&o(m,u)):u.isPointsMaterial?c(m,u,E,T):u.isSpriteMaterial?l(m,u):u.isShadowMaterial?(m.color.value.copy(u.color),m.opacity.value=u.opacity):u.isShaderMaterial&&(u.uniformsNeedUpdate=!1)}function r(m,u){m.opacity.value=u.opacity,u.color&&m.diffuse.value.copy(u.color),u.emissive&&m.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity),u.map&&(m.map.value=u.map,t(u.map,m.mapTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,t(u.alphaMap,m.alphaMapTransform)),u.bumpMap&&(m.bumpMap.value=u.bumpMap,t(u.bumpMap,m.bumpMapTransform),m.bumpScale.value=u.bumpScale,u.side===zt&&(m.bumpScale.value*=-1)),u.normalMap&&(m.normalMap.value=u.normalMap,t(u.normalMap,m.normalMapTransform),m.normalScale.value.copy(u.normalScale),u.side===zt&&m.normalScale.value.negate()),u.displacementMap&&(m.displacementMap.value=u.displacementMap,t(u.displacementMap,m.displacementMapTransform),m.displacementScale.value=u.displacementScale,m.displacementBias.value=u.displacementBias),u.emissiveMap&&(m.emissiveMap.value=u.emissiveMap,t(u.emissiveMap,m.emissiveMapTransform)),u.specularMap&&(m.specularMap.value=u.specularMap,t(u.specularMap,m.specularMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest);const E=e.get(u),T=E.envMap,S=E.envMapRotation;T&&(m.envMap.value=T,jn.copy(S),jn.x*=-1,jn.y*=-1,jn.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(jn.y*=-1,jn.z*=-1),m.envMapRotation.value.setFromMatrix4(eg.makeRotationFromEuler(jn)),m.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=u.reflectivity,m.ior.value=u.ior,m.refractionRatio.value=u.refractionRatio),u.lightMap&&(m.lightMap.value=u.lightMap,m.lightMapIntensity.value=u.lightMapIntensity,t(u.lightMap,m.lightMapTransform)),u.aoMap&&(m.aoMap.value=u.aoMap,m.aoMapIntensity.value=u.aoMapIntensity,t(u.aoMap,m.aoMapTransform))}function a(m,u){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,u.map&&(m.map.value=u.map,t(u.map,m.mapTransform))}function o(m,u){m.dashSize.value=u.dashSize,m.totalSize.value=u.dashSize+u.gapSize,m.scale.value=u.scale}function c(m,u,E,T){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,m.size.value=u.size*E,m.scale.value=T*.5,u.map&&(m.map.value=u.map,t(u.map,m.uvTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,t(u.alphaMap,m.alphaMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest)}function l(m,u){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,m.rotation.value=u.rotation,u.map&&(m.map.value=u.map,t(u.map,m.mapTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,t(u.alphaMap,m.alphaMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest)}function d(m,u){m.specular.value.copy(u.specular),m.shininess.value=Math.max(u.shininess,1e-4)}function h(m,u){u.gradientMap&&(m.gradientMap.value=u.gradientMap)}function f(m,u){m.metalness.value=u.metalness,u.metalnessMap&&(m.metalnessMap.value=u.metalnessMap,t(u.metalnessMap,m.metalnessMapTransform)),m.roughness.value=u.roughness,u.roughnessMap&&(m.roughnessMap.value=u.roughnessMap,t(u.roughnessMap,m.roughnessMapTransform)),u.envMap&&(m.envMapIntensity.value=u.envMapIntensity)}function p(m,u,E){m.ior.value=u.ior,u.sheen>0&&(m.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen),m.sheenRoughness.value=u.sheenRoughness,u.sheenColorMap&&(m.sheenColorMap.value=u.sheenColorMap,t(u.sheenColorMap,m.sheenColorMapTransform)),u.sheenRoughnessMap&&(m.sheenRoughnessMap.value=u.sheenRoughnessMap,t(u.sheenRoughnessMap,m.sheenRoughnessMapTransform))),u.clearcoat>0&&(m.clearcoat.value=u.clearcoat,m.clearcoatRoughness.value=u.clearcoatRoughness,u.clearcoatMap&&(m.clearcoatMap.value=u.clearcoatMap,t(u.clearcoatMap,m.clearcoatMapTransform)),u.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=u.clearcoatRoughnessMap,t(u.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),u.clearcoatNormalMap&&(m.clearcoatNormalMap.value=u.clearcoatNormalMap,t(u.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(u.clearcoatNormalScale),u.side===zt&&m.clearcoatNormalScale.value.negate())),u.dispersion>0&&(m.dispersion.value=u.dispersion),u.iridescence>0&&(m.iridescence.value=u.iridescence,m.iridescenceIOR.value=u.iridescenceIOR,m.iridescenceThicknessMinimum.value=u.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=u.iridescenceThicknessRange[1],u.iridescenceMap&&(m.iridescenceMap.value=u.iridescenceMap,t(u.iridescenceMap,m.iridescenceMapTransform)),u.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=u.iridescenceThicknessMap,t(u.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),u.transmission>0&&(m.transmission.value=u.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),u.transmissionMap&&(m.transmissionMap.value=u.transmissionMap,t(u.transmissionMap,m.transmissionMapTransform)),m.thickness.value=u.thickness,u.thicknessMap&&(m.thicknessMap.value=u.thicknessMap,t(u.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=u.attenuationDistance,m.attenuationColor.value.copy(u.attenuationColor)),u.anisotropy>0&&(m.anisotropyVector.value.set(u.anisotropy*Math.cos(u.anisotropyRotation),u.anisotropy*Math.sin(u.anisotropyRotation)),u.anisotropyMap&&(m.anisotropyMap.value=u.anisotropyMap,t(u.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=u.specularIntensity,m.specularColor.value.copy(u.specularColor),u.specularColorMap&&(m.specularColorMap.value=u.specularColorMap,t(u.specularColorMap,m.specularColorMapTransform)),u.specularIntensityMap&&(m.specularIntensityMap.value=u.specularIntensityMap,t(u.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,u){u.matcap&&(m.matcap.value=u.matcap)}function _(m,u){const E=e.get(u).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function ng(i,e,t,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(E,T){const S=T.program;n.uniformBlockBinding(E,S)}function l(E,T){let S=s[E.id];S===void 0&&(g(E),S=d(E),s[E.id]=S,E.addEventListener("dispose",m));const w=T.program;n.updateUBOMapping(E,w);const R=e.render.frame;r[E.id]!==R&&(f(E),r[E.id]=R)}function d(E){const T=h();E.__bindingPointIndex=T;const S=i.createBuffer(),w=E.__size,R=E.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,w,R),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,T,S),S}function h(){for(let E=0;E<o;E++)if(a.indexOf(E)===-1)return a.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(E){const T=s[E.id],S=E.uniforms,w=E.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let R=0,A=S.length;R<A;R++){const L=Array.isArray(S[R])?S[R]:[S[R]];for(let M=0,y=L.length;M<y;M++){const I=L[M];if(p(I,R,M,w)===!0){const N=I.__offset,B=Array.isArray(I.value)?I.value:[I.value];let X=0;for(let G=0;G<B.length;G++){const Y=B[G],Z=_(Y);typeof Y=="number"||typeof Y=="boolean"?(I.__data[0]=Y,i.bufferSubData(i.UNIFORM_BUFFER,N+X,I.__data)):Y.isMatrix3?(I.__data[0]=Y.elements[0],I.__data[1]=Y.elements[1],I.__data[2]=Y.elements[2],I.__data[3]=0,I.__data[4]=Y.elements[3],I.__data[5]=Y.elements[4],I.__data[6]=Y.elements[5],I.__data[7]=0,I.__data[8]=Y.elements[6],I.__data[9]=Y.elements[7],I.__data[10]=Y.elements[8],I.__data[11]=0):(Y.toArray(I.__data,X),X+=Z.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,N,I.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(E,T,S,w){const R=E.value,A=T+"_"+S;if(w[A]===void 0)return typeof R=="number"||typeof R=="boolean"?w[A]=R:w[A]=R.clone(),!0;{const L=w[A];if(typeof R=="number"||typeof R=="boolean"){if(L!==R)return w[A]=R,!0}else if(L.equals(R)===!1)return L.copy(R),!0}return!1}function g(E){const T=E.uniforms;let S=0;const w=16;for(let A=0,L=T.length;A<L;A++){const M=Array.isArray(T[A])?T[A]:[T[A]];for(let y=0,I=M.length;y<I;y++){const N=M[y],B=Array.isArray(N.value)?N.value:[N.value];for(let X=0,G=B.length;X<G;X++){const Y=B[X],Z=_(Y),$=S%w,oe=$%Z.boundary,he=$+oe;S+=oe,he!==0&&w-he<Z.storage&&(S+=w-he),N.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=S,S+=Z.storage}}}const R=S%w;return R>0&&(S+=w-R),E.__size=S,E.__cache={},this}function _(E){const T={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(T.boundary=4,T.storage=4):E.isVector2?(T.boundary=8,T.storage=8):E.isVector3||E.isColor?(T.boundary=16,T.storage=12):E.isVector4?(T.boundary=16,T.storage=16):E.isMatrix3?(T.boundary=48,T.storage=48):E.isMatrix4?(T.boundary=64,T.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),T}function m(E){const T=E.target;T.removeEventListener("dispose",m);const S=a.indexOf(T.__bindingPointIndex);a.splice(S,1),i.deleteBuffer(s[T.id]),delete s[T.id],delete r[T.id]}function u(){for(const E in s)i.deleteBuffer(s[E]);a=[],s={},r={}}return{bind:c,update:l,dispose:u}}class ig{constructor(e={}){const{canvas:t=Cd(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,u=null;const E=[],T=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=kn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const S=this;let w=!1;this._outputColorSpace=Xt;let R=0,A=0,L=null,M=-1,y=null;const I=new ft,N=new ft;let B=null;const X=new ze(0);let G=0,Y=t.width,Z=t.height,$=1,oe=null,he=null;const be=new ft(0,0,Y,Z),Ge=new ft(0,0,Y,Z);let it=!1;const ot=new Ja;let Ze=!1,j=!1;const Q=new at,pe=new O,De=new ft,Ee={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Xe=!1;function Rt(){return L===null?$:1}let C=n;function lt(x,D){return t.getContext(x,D)}try{const x={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:d,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Ga}`),t.addEventListener("webglcontextlost",re,!1),t.addEventListener("webglcontextrestored",fe,!1),t.addEventListener("webglcontextcreationerror",ee,!1),C===null){const D="webgl2";if(C=lt(D,x),C===null)throw lt(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(x){throw console.error("THREE.WebGLRenderer: "+x.message),x}let Oe,Pe,_e,ct,ve,ke,bt,mt,b,v,F,q,J,W,Se,se,xe,Me,ne,de,Ie,ye,le,Fe;function P(){Oe=new fp(C),Oe.init(),ye=new jm(C,Oe),Pe=new ap(C,Oe,e,ye),_e=new Ym(C,Oe),Pe.reversedDepthBuffer&&f&&_e.buffers.depth.setReversed(!0),ct=new gp(C),ve=new Um,ke=new qm(C,Oe,_e,ve,Pe,ye,ct),bt=new lp(S),mt=new up(S),b=new yh(C),le=new sp(C,b),v=new pp(C,b,ct,le),F=new vp(C,v,b,ct),ne=new _p(C,Pe,ke),se=new op(ve),q=new Dm(S,bt,mt,Oe,Pe,le,se),J=new tg(S,ve),W=new Om,Se=new Gm(Oe),Me=new ip(S,bt,mt,_e,F,p,c),xe=new Wm(S,F,Pe),Fe=new ng(C,ct,Pe,_e),de=new rp(C,Oe,ct),Ie=new mp(C,Oe,ct),ct.programs=q.programs,S.capabilities=Pe,S.extensions=Oe,S.properties=ve,S.renderLists=W,S.shadowMap=xe,S.state=_e,S.info=ct}P();const ie=new Qm(S,C);this.xr=ie,this.getContext=function(){return C},this.getContextAttributes=function(){return C.getContextAttributes()},this.forceContextLoss=function(){const x=Oe.get("WEBGL_lose_context");x&&x.loseContext()},this.forceContextRestore=function(){const x=Oe.get("WEBGL_lose_context");x&&x.restoreContext()},this.getPixelRatio=function(){return $},this.setPixelRatio=function(x){x!==void 0&&($=x,this.setSize(Y,Z,!1))},this.getSize=function(x){return x.set(Y,Z)},this.setSize=function(x,D,H=!0){if(ie.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Y=x,Z=D,t.width=Math.floor(x*$),t.height=Math.floor(D*$),H===!0&&(t.style.width=x+"px",t.style.height=D+"px"),this.setViewport(0,0,x,D)},this.getDrawingBufferSize=function(x){return x.set(Y*$,Z*$).floor()},this.setDrawingBufferSize=function(x,D,H){Y=x,Z=D,$=H,t.width=Math.floor(x*H),t.height=Math.floor(D*H),this.setViewport(0,0,x,D)},this.getCurrentViewport=function(x){return x.copy(I)},this.getViewport=function(x){return x.copy(be)},this.setViewport=function(x,D,H,z){x.isVector4?be.set(x.x,x.y,x.z,x.w):be.set(x,D,H,z),_e.viewport(I.copy(be).multiplyScalar($).round())},this.getScissor=function(x){return x.copy(Ge)},this.setScissor=function(x,D,H,z){x.isVector4?Ge.set(x.x,x.y,x.z,x.w):Ge.set(x,D,H,z),_e.scissor(N.copy(Ge).multiplyScalar($).round())},this.getScissorTest=function(){return it},this.setScissorTest=function(x){_e.setScissorTest(it=x)},this.setOpaqueSort=function(x){oe=x},this.setTransparentSort=function(x){he=x},this.getClearColor=function(x){return x.copy(Me.getClearColor())},this.setClearColor=function(){Me.setClearColor(...arguments)},this.getClearAlpha=function(){return Me.getClearAlpha()},this.setClearAlpha=function(){Me.setClearAlpha(...arguments)},this.clear=function(x=!0,D=!0,H=!0){let z=0;if(x){let U=!1;if(L!==null){const te=L.texture.format;U=te===ja||te===qa||te===Ya}if(U){const te=L.texture.type,ce=te===mn||te===ri||te===ns||te===is||te===$a||te===Wa,me=Me.getClearColor(),ue=Me.getClearAlpha(),Ce=me.r,Le=me.g,Ae=me.b;ce?(g[0]=Ce,g[1]=Le,g[2]=Ae,g[3]=ue,C.clearBufferuiv(C.COLOR,0,g)):(_[0]=Ce,_[1]=Le,_[2]=Ae,_[3]=ue,C.clearBufferiv(C.COLOR,0,_))}else z|=C.COLOR_BUFFER_BIT}D&&(z|=C.DEPTH_BUFFER_BIT),H&&(z|=C.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),C.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",re,!1),t.removeEventListener("webglcontextrestored",fe,!1),t.removeEventListener("webglcontextcreationerror",ee,!1),Me.dispose(),W.dispose(),Se.dispose(),ve.dispose(),bt.dispose(),mt.dispose(),F.dispose(),le.dispose(),Fe.dispose(),q.dispose(),ie.dispose(),ie.removeEventListener("sessionstart",cn),ie.removeEventListener("sessionend",oo),Gn.stop()};function re(x){x.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function fe(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const x=ct.autoReset,D=xe.enabled,H=xe.autoUpdate,z=xe.needsUpdate,U=xe.type;P(),ct.autoReset=x,xe.enabled=D,xe.autoUpdate=H,xe.needsUpdate=z,xe.type=U}function ee(x){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",x.statusMessage)}function K(x){const D=x.target;D.removeEventListener("dispose",K),ge(D)}function ge(x){Ue(x),ve.remove(x)}function Ue(x){const D=ve.get(x).programs;D!==void 0&&(D.forEach(function(H){q.releaseProgram(H)}),x.isShaderMaterial&&q.releaseShaderCache(x))}this.renderBufferDirect=function(x,D,H,z,U,te){D===null&&(D=Ee);const ce=U.isMesh&&U.matrixWorld.determinant()<0,me=Fc(x,D,H,z,U);_e.setMaterial(z,ce);let ue=H.index,Ce=1;if(z.wireframe===!0){if(ue=v.getWireframeAttribute(H),ue===void 0)return;Ce=2}const Le=H.drawRange,Ae=H.attributes.position;let Ve=Le.start*Ce,Qe=(Le.start+Le.count)*Ce;te!==null&&(Ve=Math.max(Ve,te.start*Ce),Qe=Math.min(Qe,(te.start+te.count)*Ce)),ue!==null?(Ve=Math.max(Ve,0),Qe=Math.min(Qe,ue.count)):Ae!=null&&(Ve=Math.max(Ve,0),Qe=Math.min(Qe,Ae.count));const ut=Qe-Ve;if(ut<0||ut===1/0)return;le.setup(U,z,me,H,ue);let rt,nt=de;if(ue!==null&&(rt=b.get(ue),nt=Ie,nt.setIndex(rt)),U.isMesh)z.wireframe===!0?(_e.setLineWidth(z.wireframeLinewidth*Rt()),nt.setMode(C.LINES)):nt.setMode(C.TRIANGLES);else if(U.isLine){let Re=z.linewidth;Re===void 0&&(Re=1),_e.setLineWidth(Re*Rt()),U.isLineSegments?nt.setMode(C.LINES):U.isLineLoop?nt.setMode(C.LINE_LOOP):nt.setMode(C.LINE_STRIP)}else U.isPoints?nt.setMode(C.POINTS):U.isSprite&&nt.setMode(C.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)as("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),nt.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(Oe.get("WEBGL_multi_draw"))nt.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{const Re=U._multiDrawStarts,dt=U._multiDrawCounts,je=U._multiDrawCount,Gt=ue?b.get(ue).bytesPerElement:1,ui=ve.get(z).currentProgram.getUniforms();for(let Vt=0;Vt<je;Vt++)ui.setValue(C,"_gl_DrawID",Vt),nt.render(Re[Vt]/Gt,dt[Vt])}else if(U.isInstancedMesh)nt.renderInstances(Ve,ut,U.count);else if(H.isInstancedBufferGeometry){const Re=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,dt=Math.min(H.instanceCount,Re);nt.renderInstances(Ve,ut,dt)}else nt.render(Ve,ut)};function st(x,D,H){x.transparent===!0&&x.side===hn&&x.forceSinglePass===!1?(x.side=zt,x.needsUpdate=!0,fs(x,D,H),x.side=Hn,x.needsUpdate=!0,fs(x,D,H),x.side=hn):fs(x,D,H)}this.compile=function(x,D,H=null){H===null&&(H=x),u=Se.get(H),u.init(D),T.push(u),H.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(u.pushLight(U),U.castShadow&&u.pushShadow(U))}),x!==H&&x.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(u.pushLight(U),U.castShadow&&u.pushShadow(U))}),u.setupLights();const z=new Set;return x.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;const te=U.material;if(te)if(Array.isArray(te))for(let ce=0;ce<te.length;ce++){const me=te[ce];st(me,H,U),z.add(me)}else st(te,H,U),z.add(te)}),u=T.pop(),z},this.compileAsync=function(x,D,H=null){const z=this.compile(x,D,H);return new Promise(U=>{function te(){if(z.forEach(function(ce){ve.get(ce).currentProgram.isReady()&&z.delete(ce)}),z.size===0){U(x);return}setTimeout(te,10)}Oe.get("KHR_parallel_shader_compile")!==null?te():setTimeout(te,10)})};let Je=null;function xn(x){Je&&Je(x)}function cn(){Gn.stop()}function oo(){Gn.start()}const Gn=new dc;Gn.setAnimationLoop(xn),typeof self<"u"&&Gn.setContext(self),this.setAnimationLoop=function(x){Je=x,ie.setAnimationLoop(x),x===null?Gn.stop():Gn.start()},ie.addEventListener("sessionstart",cn),ie.addEventListener("sessionend",oo),this.render=function(x,D){if(D!==void 0&&D.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;if(x.matrixWorldAutoUpdate===!0&&x.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),ie.enabled===!0&&ie.isPresenting===!0&&(ie.cameraAutoUpdate===!0&&ie.updateCamera(D),D=ie.getCamera()),x.isScene===!0&&x.onBeforeRender(S,x,D,L),u=Se.get(x,T.length),u.init(D),T.push(u),Q.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),ot.setFromProjectionMatrix(Q,pn,D.reversedDepth),j=this.localClippingEnabled,Ze=se.init(this.clippingPlanes,j),m=W.get(x,E.length),m.init(),E.push(m),ie.enabled===!0&&ie.isPresenting===!0){const te=S.xr.getDepthSensingMesh();te!==null&&gr(te,D,-1/0,S.sortObjects)}gr(x,D,0,S.sortObjects),m.finish(),S.sortObjects===!0&&m.sort(oe,he),Xe=ie.enabled===!1||ie.isPresenting===!1||ie.hasDepthSensing()===!1,Xe&&Me.addToRenderList(m,x),this.info.render.frame++,Ze===!0&&se.beginShadows();const H=u.state.shadowsArray;xe.render(H,x,D),Ze===!0&&se.endShadows(),this.info.autoReset===!0&&this.info.reset();const z=m.opaque,U=m.transmissive;if(u.setupLights(),D.isArrayCamera){const te=D.cameras;if(U.length>0)for(let ce=0,me=te.length;ce<me;ce++){const ue=te[ce];co(z,U,x,ue)}Xe&&Me.render(x);for(let ce=0,me=te.length;ce<me;ce++){const ue=te[ce];lo(m,x,ue,ue.viewport)}}else U.length>0&&co(z,U,x,D),Xe&&Me.render(x),lo(m,x,D);L!==null&&A===0&&(ke.updateMultisampleRenderTarget(L),ke.updateRenderTargetMipmap(L)),x.isScene===!0&&x.onAfterRender(S,x,D),le.resetDefaultState(),M=-1,y=null,T.pop(),T.length>0?(u=T[T.length-1],Ze===!0&&se.setGlobalState(S.clippingPlanes,u.state.camera)):u=null,E.pop(),E.length>0?m=E[E.length-1]:m=null};function gr(x,D,H,z){if(x.visible===!1)return;if(x.layers.test(D.layers)){if(x.isGroup)H=x.renderOrder;else if(x.isLOD)x.autoUpdate===!0&&x.update(D);else if(x.isLight)u.pushLight(x),x.castShadow&&u.pushShadow(x);else if(x.isSprite){if(!x.frustumCulled||ot.intersectsSprite(x)){z&&De.setFromMatrixPosition(x.matrixWorld).applyMatrix4(Q);const ce=F.update(x),me=x.material;me.visible&&m.push(x,ce,me,H,De.z,null)}}else if((x.isMesh||x.isLine||x.isPoints)&&(!x.frustumCulled||ot.intersectsObject(x))){const ce=F.update(x),me=x.material;if(z&&(x.boundingSphere!==void 0?(x.boundingSphere===null&&x.computeBoundingSphere(),De.copy(x.boundingSphere.center)):(ce.boundingSphere===null&&ce.computeBoundingSphere(),De.copy(ce.boundingSphere.center)),De.applyMatrix4(x.matrixWorld).applyMatrix4(Q)),Array.isArray(me)){const ue=ce.groups;for(let Ce=0,Le=ue.length;Ce<Le;Ce++){const Ae=ue[Ce],Ve=me[Ae.materialIndex];Ve&&Ve.visible&&m.push(x,ce,Ve,H,De.z,Ae)}}else me.visible&&m.push(x,ce,me,H,De.z,null)}}const te=x.children;for(let ce=0,me=te.length;ce<me;ce++)gr(te[ce],D,H,z)}function lo(x,D,H,z){const U=x.opaque,te=x.transmissive,ce=x.transparent;u.setupLightsView(H),Ze===!0&&se.setGlobalState(S.clippingPlanes,H),z&&_e.viewport(I.copy(z)),U.length>0&&us(U,D,H),te.length>0&&us(te,D,H),ce.length>0&&us(ce,D,H),_e.buffers.depth.setTest(!0),_e.buffers.depth.setMask(!0),_e.buffers.color.setMask(!0),_e.setPolygonOffset(!1)}function co(x,D,H,z){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;u.state.transmissionRenderTarget[z.id]===void 0&&(u.state.transmissionRenderTarget[z.id]=new ai(1,1,{generateMipmaps:!0,type:Oe.has("EXT_color_buffer_half_float")||Oe.has("EXT_color_buffer_float")?ls:mn,minFilter:ni,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ke.workingColorSpace}));const te=u.state.transmissionRenderTarget[z.id],ce=z.viewport||I;te.setSize(ce.z*S.transmissionResolutionScale,ce.w*S.transmissionResolutionScale);const me=S.getRenderTarget(),ue=S.getActiveCubeFace(),Ce=S.getActiveMipmapLevel();S.setRenderTarget(te),S.getClearColor(X),G=S.getClearAlpha(),G<1&&S.setClearColor(16777215,.5),S.clear(),Xe&&Me.render(H);const Le=S.toneMapping;S.toneMapping=kn;const Ae=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),u.setupLightsView(z),Ze===!0&&se.setGlobalState(S.clippingPlanes,z),us(x,H,z),ke.updateMultisampleRenderTarget(te),ke.updateRenderTargetMipmap(te),Oe.has("WEBGL_multisampled_render_to_texture")===!1){let Ve=!1;for(let Qe=0,ut=D.length;Qe<ut;Qe++){const rt=D[Qe],nt=rt.object,Re=rt.geometry,dt=rt.material,je=rt.group;if(dt.side===hn&&nt.layers.test(z.layers)){const Gt=dt.side;dt.side=zt,dt.needsUpdate=!0,ho(nt,H,z,Re,dt,je),dt.side=Gt,dt.needsUpdate=!0,Ve=!0}}Ve===!0&&(ke.updateMultisampleRenderTarget(te),ke.updateRenderTargetMipmap(te))}S.setRenderTarget(me,ue,Ce),S.setClearColor(X,G),Ae!==void 0&&(z.viewport=Ae),S.toneMapping=Le}function us(x,D,H){const z=D.isScene===!0?D.overrideMaterial:null;for(let U=0,te=x.length;U<te;U++){const ce=x[U],me=ce.object,ue=ce.geometry,Ce=ce.group;let Le=ce.material;Le.allowOverride===!0&&z!==null&&(Le=z),me.layers.test(H.layers)&&ho(me,D,H,ue,Le,Ce)}}function ho(x,D,H,z,U,te){x.onBeforeRender(S,D,H,z,U,te),x.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,x.matrixWorld),x.normalMatrix.getNormalMatrix(x.modelViewMatrix),U.onBeforeRender(S,D,H,z,x,te),U.transparent===!0&&U.side===hn&&U.forceSinglePass===!1?(U.side=zt,U.needsUpdate=!0,S.renderBufferDirect(H,D,z,U,x,te),U.side=Hn,U.needsUpdate=!0,S.renderBufferDirect(H,D,z,U,x,te),U.side=hn):S.renderBufferDirect(H,D,z,U,x,te),x.onAfterRender(S,D,H,z,U,te)}function fs(x,D,H){D.isScene!==!0&&(D=Ee);const z=ve.get(x),U=u.state.lights,te=u.state.shadowsArray,ce=U.state.version,me=q.getParameters(x,U.state,te,D,H),ue=q.getProgramCacheKey(me);let Ce=z.programs;z.environment=x.isMeshStandardMaterial?D.environment:null,z.fog=D.fog,z.envMap=(x.isMeshStandardMaterial?mt:bt).get(x.envMap||z.environment),z.envMapRotation=z.environment!==null&&x.envMap===null?D.environmentRotation:x.envMapRotation,Ce===void 0&&(x.addEventListener("dispose",K),Ce=new Map,z.programs=Ce);let Le=Ce.get(ue);if(Le!==void 0){if(z.currentProgram===Le&&z.lightsStateVersion===ce)return fo(x,me),Le}else me.uniforms=q.getUniforms(x),x.onBeforeCompile(me,S),Le=q.acquireProgram(me,ue),Ce.set(ue,Le),z.uniforms=me.uniforms;const Ae=z.uniforms;return(!x.isShaderMaterial&&!x.isRawShaderMaterial||x.clipping===!0)&&(Ae.clippingPlanes=se.uniform),fo(x,me),z.needsLights=kc(x),z.lightsStateVersion=ce,z.needsLights&&(Ae.ambientLightColor.value=U.state.ambient,Ae.lightProbe.value=U.state.probe,Ae.directionalLights.value=U.state.directional,Ae.directionalLightShadows.value=U.state.directionalShadow,Ae.spotLights.value=U.state.spot,Ae.spotLightShadows.value=U.state.spotShadow,Ae.rectAreaLights.value=U.state.rectArea,Ae.ltc_1.value=U.state.rectAreaLTC1,Ae.ltc_2.value=U.state.rectAreaLTC2,Ae.pointLights.value=U.state.point,Ae.pointLightShadows.value=U.state.pointShadow,Ae.hemisphereLights.value=U.state.hemi,Ae.directionalShadowMap.value=U.state.directionalShadowMap,Ae.directionalShadowMatrix.value=U.state.directionalShadowMatrix,Ae.spotShadowMap.value=U.state.spotShadowMap,Ae.spotLightMatrix.value=U.state.spotLightMatrix,Ae.spotLightMap.value=U.state.spotLightMap,Ae.pointShadowMap.value=U.state.pointShadowMap,Ae.pointShadowMatrix.value=U.state.pointShadowMatrix),z.currentProgram=Le,z.uniformsList=null,Le}function uo(x){if(x.uniformsList===null){const D=x.currentProgram.getUniforms();x.uniformsList=Ks.seqWithValue(D.seq,x.uniforms)}return x.uniformsList}function fo(x,D){const H=ve.get(x);H.outputColorSpace=D.outputColorSpace,H.batching=D.batching,H.batchingColor=D.batchingColor,H.instancing=D.instancing,H.instancingColor=D.instancingColor,H.instancingMorph=D.instancingMorph,H.skinning=D.skinning,H.morphTargets=D.morphTargets,H.morphNormals=D.morphNormals,H.morphColors=D.morphColors,H.morphTargetsCount=D.morphTargetsCount,H.numClippingPlanes=D.numClippingPlanes,H.numIntersection=D.numClipIntersection,H.vertexAlphas=D.vertexAlphas,H.vertexTangents=D.vertexTangents,H.toneMapping=D.toneMapping}function Fc(x,D,H,z,U){D.isScene!==!0&&(D=Ee),ke.resetTextureUnits();const te=D.fog,ce=z.isMeshStandardMaterial?D.environment:null,me=L===null?S.outputColorSpace:L.isXRRenderTarget===!0?L.texture.colorSpace:Bi,ue=(z.isMeshStandardMaterial?mt:bt).get(z.envMap||ce),Ce=z.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,Le=!!H.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),Ae=!!H.morphAttributes.position,Ve=!!H.morphAttributes.normal,Qe=!!H.morphAttributes.color;let ut=kn;z.toneMapped&&(L===null||L.isXRRenderTarget===!0)&&(ut=S.toneMapping);const rt=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,nt=rt!==void 0?rt.length:0,Re=ve.get(z),dt=u.state.lights;if(Ze===!0&&(j===!0||x!==y)){const Ut=x===y&&z.id===M;se.setState(z,x,Ut)}let je=!1;z.version===Re.__version?(Re.needsLights&&Re.lightsStateVersion!==dt.state.version||Re.outputColorSpace!==me||U.isBatchedMesh&&Re.batching===!1||!U.isBatchedMesh&&Re.batching===!0||U.isBatchedMesh&&Re.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&Re.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&Re.instancing===!1||!U.isInstancedMesh&&Re.instancing===!0||U.isSkinnedMesh&&Re.skinning===!1||!U.isSkinnedMesh&&Re.skinning===!0||U.isInstancedMesh&&Re.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&Re.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&Re.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&Re.instancingMorph===!1&&U.morphTexture!==null||Re.envMap!==ue||z.fog===!0&&Re.fog!==te||Re.numClippingPlanes!==void 0&&(Re.numClippingPlanes!==se.numPlanes||Re.numIntersection!==se.numIntersection)||Re.vertexAlphas!==Ce||Re.vertexTangents!==Le||Re.morphTargets!==Ae||Re.morphNormals!==Ve||Re.morphColors!==Qe||Re.toneMapping!==ut||Re.morphTargetsCount!==nt)&&(je=!0):(je=!0,Re.__version=z.version);let Gt=Re.currentProgram;je===!0&&(Gt=fs(z,D,U));let ui=!1,Vt=!1,Xi=!1;const ht=Gt.getUniforms(),Zt=Re.uniforms;if(_e.useProgram(Gt.program)&&(ui=!0,Vt=!0,Xi=!0),z.id!==M&&(M=z.id,Vt=!0),ui||y!==x){_e.buffers.depth.getReversed()&&x.reversedDepth!==!0&&(x._reversedDepth=!0,x.updateProjectionMatrix()),ht.setValue(C,"projectionMatrix",x.projectionMatrix),ht.setValue(C,"viewMatrix",x.matrixWorldInverse);const Bt=ht.map.cameraPosition;Bt!==void 0&&Bt.setValue(C,pe.setFromMatrixPosition(x.matrixWorld)),Pe.logarithmicDepthBuffer&&ht.setValue(C,"logDepthBufFC",2/(Math.log(x.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&ht.setValue(C,"isOrthographic",x.isOrthographicCamera===!0),y!==x&&(y=x,Vt=!0,Xi=!0)}if(U.isSkinnedMesh){ht.setOptional(C,U,"bindMatrix"),ht.setOptional(C,U,"bindMatrixInverse");const Ut=U.skeleton;Ut&&(Ut.boneTexture===null&&Ut.computeBoneTexture(),ht.setValue(C,"boneTexture",Ut.boneTexture,ke))}U.isBatchedMesh&&(ht.setOptional(C,U,"batchingTexture"),ht.setValue(C,"batchingTexture",U._matricesTexture,ke),ht.setOptional(C,U,"batchingIdTexture"),ht.setValue(C,"batchingIdTexture",U._indirectTexture,ke),ht.setOptional(C,U,"batchingColorTexture"),U._colorsTexture!==null&&ht.setValue(C,"batchingColorTexture",U._colorsTexture,ke));const Jt=H.morphAttributes;if((Jt.position!==void 0||Jt.normal!==void 0||Jt.color!==void 0)&&ne.update(U,H,Gt),(Vt||Re.receiveShadow!==U.receiveShadow)&&(Re.receiveShadow=U.receiveShadow,ht.setValue(C,"receiveShadow",U.receiveShadow)),z.isMeshGouraudMaterial&&z.envMap!==null&&(Zt.envMap.value=ue,Zt.flipEnvMap.value=ue.isCubeTexture&&ue.isRenderTargetTexture===!1?-1:1),z.isMeshStandardMaterial&&z.envMap===null&&D.environment!==null&&(Zt.envMapIntensity.value=D.environmentIntensity),Vt&&(ht.setValue(C,"toneMappingExposure",S.toneMappingExposure),Re.needsLights&&Bc(Zt,Xi),te&&z.fog===!0&&J.refreshFogUniforms(Zt,te),J.refreshMaterialUniforms(Zt,z,$,Z,u.state.transmissionRenderTarget[x.id]),Ks.upload(C,uo(Re),Zt,ke)),z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(Ks.upload(C,uo(Re),Zt,ke),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&ht.setValue(C,"center",U.center),ht.setValue(C,"modelViewMatrix",U.modelViewMatrix),ht.setValue(C,"normalMatrix",U.normalMatrix),ht.setValue(C,"modelMatrix",U.matrixWorld),z.isShaderMaterial||z.isRawShaderMaterial){const Ut=z.uniformsGroups;for(let Bt=0,_r=Ut.length;Bt<_r;Bt++){const Vn=Ut[Bt];Fe.update(Vn,Gt),Fe.bind(Vn,Gt)}}return Gt}function Bc(x,D){x.ambientLightColor.needsUpdate=D,x.lightProbe.needsUpdate=D,x.directionalLights.needsUpdate=D,x.directionalLightShadows.needsUpdate=D,x.pointLights.needsUpdate=D,x.pointLightShadows.needsUpdate=D,x.spotLights.needsUpdate=D,x.spotLightShadows.needsUpdate=D,x.rectAreaLights.needsUpdate=D,x.hemisphereLights.needsUpdate=D}function kc(x){return x.isMeshLambertMaterial||x.isMeshToonMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isShadowMaterial||x.isShaderMaterial&&x.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return L},this.setRenderTargetTextures=function(x,D,H){const z=ve.get(x);z.__autoAllocateDepthBuffer=x.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),ve.get(x.texture).__webglTexture=D,ve.get(x.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:H,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(x,D){const H=ve.get(x);H.__webglFramebuffer=D,H.__useDefaultFramebuffer=D===void 0};const Hc=C.createFramebuffer();this.setRenderTarget=function(x,D=0,H=0){L=x,R=D,A=H;let z=!0,U=null,te=!1,ce=!1;if(x){const ue=ve.get(x);if(ue.__useDefaultFramebuffer!==void 0)_e.bindFramebuffer(C.FRAMEBUFFER,null),z=!1;else if(ue.__webglFramebuffer===void 0)ke.setupRenderTarget(x);else if(ue.__hasExternalTextures)ke.rebindTextures(x,ve.get(x.texture).__webglTexture,ve.get(x.depthTexture).__webglTexture);else if(x.depthBuffer){const Ae=x.depthTexture;if(ue.__boundDepthTexture!==Ae){if(Ae!==null&&ve.has(Ae)&&(x.width!==Ae.image.width||x.height!==Ae.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");ke.setupDepthRenderbuffer(x)}}const Ce=x.texture;(Ce.isData3DTexture||Ce.isDataArrayTexture||Ce.isCompressedArrayTexture)&&(ce=!0);const Le=ve.get(x).__webglFramebuffer;x.isWebGLCubeRenderTarget?(Array.isArray(Le[D])?U=Le[D][H]:U=Le[D],te=!0):x.samples>0&&ke.useMultisampledRTT(x)===!1?U=ve.get(x).__webglMultisampledFramebuffer:Array.isArray(Le)?U=Le[H]:U=Le,I.copy(x.viewport),N.copy(x.scissor),B=x.scissorTest}else I.copy(be).multiplyScalar($).floor(),N.copy(Ge).multiplyScalar($).floor(),B=it;if(H!==0&&(U=Hc),_e.bindFramebuffer(C.FRAMEBUFFER,U)&&z&&_e.drawBuffers(x,U),_e.viewport(I),_e.scissor(N),_e.setScissorTest(B),te){const ue=ve.get(x.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_CUBE_MAP_POSITIVE_X+D,ue.__webglTexture,H)}else if(ce){const ue=D;for(let Ce=0;Ce<x.textures.length;Ce++){const Le=ve.get(x.textures[Ce]);C.framebufferTextureLayer(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0+Ce,Le.__webglTexture,H,ue)}}else if(x!==null&&H!==0){const ue=ve.get(x.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,ue.__webglTexture,H)}M=-1},this.readRenderTargetPixels=function(x,D,H,z,U,te,ce,me=0){if(!(x&&x.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ue=ve.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&ce!==void 0&&(ue=ue[ce]),ue){_e.bindFramebuffer(C.FRAMEBUFFER,ue);try{const Ce=x.textures[me],Le=Ce.format,Ae=Ce.type;if(!Pe.textureFormatReadable(Le)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Pe.textureTypeReadable(Ae)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=x.width-z&&H>=0&&H<=x.height-U&&(x.textures.length>1&&C.readBuffer(C.COLOR_ATTACHMENT0+me),C.readPixels(D,H,z,U,ye.convert(Le),ye.convert(Ae),te))}finally{const Ce=L!==null?ve.get(L).__webglFramebuffer:null;_e.bindFramebuffer(C.FRAMEBUFFER,Ce)}}},this.readRenderTargetPixelsAsync=async function(x,D,H,z,U,te,ce,me=0){if(!(x&&x.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ue=ve.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&ce!==void 0&&(ue=ue[ce]),ue)if(D>=0&&D<=x.width-z&&H>=0&&H<=x.height-U){_e.bindFramebuffer(C.FRAMEBUFFER,ue);const Ce=x.textures[me],Le=Ce.format,Ae=Ce.type;if(!Pe.textureFormatReadable(Le))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Pe.textureTypeReadable(Ae))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Ve=C.createBuffer();C.bindBuffer(C.PIXEL_PACK_BUFFER,Ve),C.bufferData(C.PIXEL_PACK_BUFFER,te.byteLength,C.STREAM_READ),x.textures.length>1&&C.readBuffer(C.COLOR_ATTACHMENT0+me),C.readPixels(D,H,z,U,ye.convert(Le),ye.convert(Ae),0);const Qe=L!==null?ve.get(L).__webglFramebuffer:null;_e.bindFramebuffer(C.FRAMEBUFFER,Qe);const ut=C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE,0);return C.flush(),await Id(C,ut,4),C.bindBuffer(C.PIXEL_PACK_BUFFER,Ve),C.getBufferSubData(C.PIXEL_PACK_BUFFER,0,te),C.deleteBuffer(Ve),C.deleteSync(ut),te}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(x,D=null,H=0){const z=Math.pow(2,-H),U=Math.floor(x.image.width*z),te=Math.floor(x.image.height*z),ce=D!==null?D.x:0,me=D!==null?D.y:0;ke.setTexture2D(x,0),C.copyTexSubImage2D(C.TEXTURE_2D,H,0,0,ce,me,U,te),_e.unbindTexture()};const zc=C.createFramebuffer(),Gc=C.createFramebuffer();this.copyTextureToTexture=function(x,D,H=null,z=null,U=0,te=null){te===null&&(U!==0?(as("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),te=U,U=0):te=0);let ce,me,ue,Ce,Le,Ae,Ve,Qe,ut;const rt=x.isCompressedTexture?x.mipmaps[te]:x.image;if(H!==null)ce=H.max.x-H.min.x,me=H.max.y-H.min.y,ue=H.isBox3?H.max.z-H.min.z:1,Ce=H.min.x,Le=H.min.y,Ae=H.isBox3?H.min.z:0;else{const Jt=Math.pow(2,-U);ce=Math.floor(rt.width*Jt),me=Math.floor(rt.height*Jt),x.isDataArrayTexture?ue=rt.depth:x.isData3DTexture?ue=Math.floor(rt.depth*Jt):ue=1,Ce=0,Le=0,Ae=0}z!==null?(Ve=z.x,Qe=z.y,ut=z.z):(Ve=0,Qe=0,ut=0);const nt=ye.convert(D.format),Re=ye.convert(D.type);let dt;D.isData3DTexture?(ke.setTexture3D(D,0),dt=C.TEXTURE_3D):D.isDataArrayTexture||D.isCompressedArrayTexture?(ke.setTexture2DArray(D,0),dt=C.TEXTURE_2D_ARRAY):(ke.setTexture2D(D,0),dt=C.TEXTURE_2D),C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,D.flipY),C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),C.pixelStorei(C.UNPACK_ALIGNMENT,D.unpackAlignment);const je=C.getParameter(C.UNPACK_ROW_LENGTH),Gt=C.getParameter(C.UNPACK_IMAGE_HEIGHT),ui=C.getParameter(C.UNPACK_SKIP_PIXELS),Vt=C.getParameter(C.UNPACK_SKIP_ROWS),Xi=C.getParameter(C.UNPACK_SKIP_IMAGES);C.pixelStorei(C.UNPACK_ROW_LENGTH,rt.width),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,rt.height),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Ce),C.pixelStorei(C.UNPACK_SKIP_ROWS,Le),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Ae);const ht=x.isDataArrayTexture||x.isData3DTexture,Zt=D.isDataArrayTexture||D.isData3DTexture;if(x.isDepthTexture){const Jt=ve.get(x),Ut=ve.get(D),Bt=ve.get(Jt.__renderTarget),_r=ve.get(Ut.__renderTarget);_e.bindFramebuffer(C.READ_FRAMEBUFFER,Bt.__webglFramebuffer),_e.bindFramebuffer(C.DRAW_FRAMEBUFFER,_r.__webglFramebuffer);for(let Vn=0;Vn<ue;Vn++)ht&&(C.framebufferTextureLayer(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,ve.get(x).__webglTexture,U,Ae+Vn),C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,ve.get(D).__webglTexture,te,ut+Vn)),C.blitFramebuffer(Ce,Le,ce,me,Ve,Qe,ce,me,C.DEPTH_BUFFER_BIT,C.NEAREST);_e.bindFramebuffer(C.READ_FRAMEBUFFER,null),_e.bindFramebuffer(C.DRAW_FRAMEBUFFER,null)}else if(U!==0||x.isRenderTargetTexture||ve.has(x)){const Jt=ve.get(x),Ut=ve.get(D);_e.bindFramebuffer(C.READ_FRAMEBUFFER,zc),_e.bindFramebuffer(C.DRAW_FRAMEBUFFER,Gc);for(let Bt=0;Bt<ue;Bt++)ht?C.framebufferTextureLayer(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,Jt.__webglTexture,U,Ae+Bt):C.framebufferTexture2D(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,Jt.__webglTexture,U),Zt?C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,Ut.__webglTexture,te,ut+Bt):C.framebufferTexture2D(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,Ut.__webglTexture,te),U!==0?C.blitFramebuffer(Ce,Le,ce,me,Ve,Qe,ce,me,C.COLOR_BUFFER_BIT,C.NEAREST):Zt?C.copyTexSubImage3D(dt,te,Ve,Qe,ut+Bt,Ce,Le,ce,me):C.copyTexSubImage2D(dt,te,Ve,Qe,Ce,Le,ce,me);_e.bindFramebuffer(C.READ_FRAMEBUFFER,null),_e.bindFramebuffer(C.DRAW_FRAMEBUFFER,null)}else Zt?x.isDataTexture||x.isData3DTexture?C.texSubImage3D(dt,te,Ve,Qe,ut,ce,me,ue,nt,Re,rt.data):D.isCompressedArrayTexture?C.compressedTexSubImage3D(dt,te,Ve,Qe,ut,ce,me,ue,nt,rt.data):C.texSubImage3D(dt,te,Ve,Qe,ut,ce,me,ue,nt,Re,rt):x.isDataTexture?C.texSubImage2D(C.TEXTURE_2D,te,Ve,Qe,ce,me,nt,Re,rt.data):x.isCompressedTexture?C.compressedTexSubImage2D(C.TEXTURE_2D,te,Ve,Qe,rt.width,rt.height,nt,rt.data):C.texSubImage2D(C.TEXTURE_2D,te,Ve,Qe,ce,me,nt,Re,rt);C.pixelStorei(C.UNPACK_ROW_LENGTH,je),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,Gt),C.pixelStorei(C.UNPACK_SKIP_PIXELS,ui),C.pixelStorei(C.UNPACK_SKIP_ROWS,Vt),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Xi),te===0&&D.generateMipmaps&&C.generateMipmap(dt),_e.unbindTexture()},this.initRenderTarget=function(x){ve.get(x).__webglFramebuffer===void 0&&ke.setupRenderTarget(x)},this.initTexture=function(x){x.isCubeTexture?ke.setTextureCube(x,0):x.isData3DTexture?ke.setTexture3D(x,0):x.isDataArrayTexture||x.isCompressedArrayTexture?ke.setTexture2DArray(x,0):ke.setTexture2D(x,0),_e.unbindTexture()},this.resetState=function(){R=0,A=0,L=null,_e.reset(),le.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return pn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Ke._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ke._getUnpackColorSpace()}}function sg(i,e){const t=i.number%2?e.primary:e.secondary,n=`${i.id}-${i.number}`,s=["M42 65Q35 27 62 19q18-13 39 0 25 4 20 46l-8-23Q82 25 49 48Z","M42 62Q39 28 80 25q41 2 38 39l-12-20Q80 33 51 47Z","M43 62Q36 35 51 25l6 4 7-10 7 5 9-12 8 11 10-7 6 10 9-2q10 15 4 40l-12-23Q78 35 49 48Z","M41 67Q36 28 80 22q44 6 39 45l-9-25Q80 30 48 49Z"];return`<svg class="player-portrait" viewBox="0 0 160 180" role="img" aria-label="Generated portrait of ${i.name}"><defs><radialGradient id="p-${n}" cx="50%" cy="28%"><stop stop-color="${e.primary}" stop-opacity=".72"/><stop offset="1" stop-color="#07111f" stop-opacity="0"/></radialGradient><linearGradient id="s-${n}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${i.skin}"/><stop offset=".62" stop-color="${i.skin}"/><stop offset="1" stop-color="#3b211b" stop-opacity=".72"/></linearGradient><linearGradient id="j-${n}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${t}"/><stop offset="1" stop-color="#07111f"/></linearGradient></defs><rect width="160" height="180" rx="20" fill="url(#p-${n})"/><circle cx="80" cy="76" r="69" fill="none" stroke="${e.secondary}" stroke-opacity=".13"/><path d="M18 180Q21 137 57 126h46q36 11 39 54" fill="url(#j-${n})"/><path d="M48 137 64 126 80 151 96 126l16 11" fill="none" stroke="${e.ink}" stroke-width="5" opacity=".85"/><path d="M67 105h26v30q-13 14-26 0Z" fill="${i.skin}"/><path d="M67 109q13 13 26 0v12q-13 9-26 0" fill="#2b1715" opacity=".25"/><ellipse cx="44" cy="81" rx="8" ry="13" fill="${i.skin}"/><ellipse cx="116" cy="81" rx="8" ry="13" fill="${i.skin}"/><path d="M43 55Q44 27 80 25q36 2 37 30l-3 39q-4 31-34 38-30-7-34-38Z" fill="url(#s-${n})"/><path d="${s[i.number%s.length]}" fill="${i.hair}"/><path d="M53 67q10-6 20 0M87 67q10-6 20 0" fill="none" stroke="${i.hair}" stroke-width="4" stroke-linecap="round"/><path d="M55 76q8-5 16 0M89 76q8-5 16 0" fill="none" stroke="#f2ede6" stroke-width="3" stroke-linecap="round"/><circle cx="64" cy="76" r="2.4" fill="#171319"/><circle cx="97" cy="76" r="2.4" fill="#171319"/><path d="M80 76 75 94q5 5 12 0" fill="none" stroke="#40251f" stroke-opacity=".55" stroke-width="2.5" stroke-linecap="round"/><path d="M65 106q15 9 30 0-15 18-30 0" fill="#f0e4dc" opacity=".9"/><path d="M65 106q15 6 30 0" fill="none" stroke="#4a2925" stroke-width="2"/>${i.number%3===0?`<path d="M51 94q5 32 29 36 24-4 29-36-5 25-29 27-24-2-29-27" fill="${i.hair}" opacity=".88"/>`:""}<path d="M52 56q8-8 18-10" stroke="#ffffff" stroke-opacity=".12" stroke-width="5" stroke-linecap="round"/><text x="80" y="174" text-anchor="middle" fill="${e.ink}" font-family="Arial Black,Arial" font-size="22">${i.number}</text></svg>`}function rg(i){return`<svg class="owner-portrait" viewBox="0 0 240 300" role="img" aria-label="Generated portrait of owner Morgan Sterling"><defs><linearGradient id="owner-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${i.primary}"/><stop offset="1" stop-color="#030812"/></linearGradient><linearGradient id="owner-suit"><stop stop-color="#24354a"/><stop offset="1" stop-color="#080f1a"/></linearGradient></defs><rect width="240" height="300" fill="url(#owner-bg)"/><circle cx="120" cy="105" r="102" fill="#ffffff08"/><path d="M25 300q8-108 72-115h46q64 7 72 115" fill="url(#owner-suit)"/><path d="m89 187 31 59 31-59-15-10h-32Z" fill="#f2f3f0"/><path d="m113 208 7 11-8 62h18l-8-62 7-11-9-9Z" fill="${i.secondary}"/><path d="M101 154h38v42q-19 18-38 0Z" fill="#b98262"/><ellipse cx="120" cy="111" rx="55" ry="68" fill="#c99573"/><ellipse cx="65" cy="112" rx="9" ry="16" fill="#b98262"/><ellipse cx="175" cy="112" rx="9" ry="16" fill="#b98262"/><path d="M66 99Q56 38 112 31q66-3 63 68l-15-35Q120 43 76 70Z" fill="#c4c9ca"/><path d="M77 83q16-9 31 0M132 83q16-9 29 0" stroke="#5b4a42" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M82 98h22M136 98h22" stroke="#f4eee6" stroke-width="4" stroke-linecap="round"/><circle cx="95" cy="98" r="3" fill="#252229"/><circle cx="146" cy="98" r="3" fill="#252229"/><path d="m120 98-7 29q8 6 17 0M99 145q21 12 43-1" stroke="#755044" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M82 119q8 5 17 1M141 120q8 4 16-1M107 157q13 5 27-1" stroke="#9a6b55" stroke-width="2" fill="none" opacity=".65"/></svg>`}const mc="bscfd-legendary-gm-v1",gc=1,Mt=[{id:"aurora",city:"Aurora",name:"Comets",short:"AUR",primary:"#6c5ce7",secondary:"#45e6e6",ink:"#f7f5ff",offense:82,defense:75,market:68},{id:"baltimore",city:"Baltimore",name:"Harbor",short:"BAL",primary:"#ef476f",secondary:"#ffd166",ink:"#ffffff",offense:77,defense:81,market:72},{id:"boston",city:"Boston",name:"Foundry",short:"BOS",primary:"#1b9e77",secondary:"#d9f99d",ink:"#ffffff",offense:84,defense:84,market:86},{id:"brooklyn",city:"Brooklyn",name:"Pulse",short:"BKN",primary:"#161b2e",secondary:"#5ee7ff",ink:"#ffffff",offense:86,defense:73,market:91},{id:"chicago",city:"Chicago",name:"Stampede",short:"CHI",primary:"#d92038",secondary:"#f7f7f2",ink:"#ffffff",offense:78,defense:79,market:93},{id:"cleveland",city:"Cleveland",name:"Engines",short:"CLE",primary:"#8a1538",secondary:"#ffb81c",ink:"#ffffff",offense:74,defense:77,market:65},{id:"dallas",city:"Dallas",name:"Outlaws",short:"DAL",primary:"#1261a0",secondary:"#b8c4ce",ink:"#ffffff",offense:88,defense:76,market:84},{id:"denver",city:"Denver",name:"Summit",short:"DEN",primary:"#183a6b",secondary:"#ffcf4a",ink:"#ffffff",offense:85,defense:83,market:71},{id:"detroit",city:"Detroit",name:"Voltage",short:"DET",primary:"#0057b8",secondary:"#ff3b30",ink:"#ffffff",offense:72,defense:80,market:70},{id:"golden",city:"Golden State",name:"Tide",short:"GST",primary:"#006bb6",secondary:"#fdb927",ink:"#ffffff",offense:90,defense:82,market:95},{id:"houston",city:"Houston",name:"Meteors",short:"HOU",primary:"#ce1141",secondary:"#c4ced4",ink:"#ffffff",offense:83,defense:78,market:87},{id:"indiana",city:"Indiana",name:"Cruisers",short:"IND",primary:"#002d62",secondary:"#fdbb30",ink:"#ffffff",offense:80,defense:82,market:62},{id:"las-vegas",city:"Las Vegas",name:"Aces High",short:"LVA",primary:"#7b2cbf",secondary:"#ffd60a",ink:"#ffffff",offense:81,defense:72,market:78},{id:"los-angeles",city:"Los Angeles",name:"Stars",short:"LAS",primary:"#552583",secondary:"#fdb927",ink:"#ffffff",offense:87,defense:85,market:99},{id:"memphis",city:"Memphis",name:"Blues",short:"MEM",primary:"#5d76a9",secondary:"#12173f",ink:"#ffffff",offense:75,defense:86,market:58},{id:"miami",city:"Miami",name:"Inferno",short:"MIA",primary:"#98002e",secondary:"#f9a01b",ink:"#ffffff",offense:82,defense:87,market:89},{id:"milwaukee",city:"Milwaukee",name:"Stags",short:"MIL",primary:"#00471b",secondary:"#eee1c6",ink:"#ffffff",offense:84,defense:88,market:64},{id:"minnesota",city:"Minnesota",name:"Timber",short:"MIN",primary:"#0c2340",secondary:"#78be20",ink:"#ffffff",offense:79,defense:81,market:66},{id:"new-orleans",city:"New Orleans",name:"Brass",short:"NOB",primary:"#0a2240",secondary:"#c8102e",ink:"#ffffff",offense:78,defense:76,market:61},{id:"new-york",city:"New York",name:"Empire",short:"NYE",primary:"#006bb6",secondary:"#f58426",ink:"#ffffff",offense:83,defense:80,market:100},{id:"oklahoma",city:"Oklahoma City",name:"Storm",short:"OKC",primary:"#007ac1",secondary:"#ef3b24",ink:"#ffffff",offense:86,defense:89,market:60},{id:"orlando",city:"Orlando",name:"Illusion",short:"ORL",primary:"#0077c0",secondary:"#c4ced4",ink:"#ffffff",offense:76,defense:78,market:67},{id:"philadelphia",city:"Philadelphia",name:"Liberty",short:"PHI",primary:"#006bb6",secondary:"#ed174c",ink:"#ffffff",offense:85,defense:84,market:85},{id:"phoenix",city:"Phoenix",name:"Sol",short:"PHX",primary:"#5f259f",secondary:"#ff6b35",ink:"#ffffff",offense:89,defense:77,market:76},{id:"portland",city:"Portland",name:"Roses",short:"POR",primary:"#e03a3e",secondary:"#bac3c9",ink:"#ffffff",offense:80,defense:75,market:63},{id:"sacramento",city:"Sacramento",name:"Regal",short:"SAC",primary:"#5a2d81",secondary:"#63727a",ink:"#ffffff",offense:82,defense:74,market:62},{id:"san-antonio",city:"San Antonio",name:"Sentries",short:"SAS",primary:"#343a40",secondary:"#c4ced4",ink:"#ffffff",offense:79,defense:88,market:69},{id:"seattle",city:"Seattle",name:"Sound",short:"SEA",primary:"#006241",secondary:"#ffc72c",ink:"#ffffff",offense:81,defense:85,market:82},{id:"toronto",city:"Toronto",name:"North",short:"TOR",primary:"#ce1141",secondary:"#a1a1a4",ink:"#ffffff",offense:83,defense:83,market:88},{id:"utah",city:"Utah",name:"Altitude",short:"UTA",primary:"#00471b",secondary:"#f9a01b",ink:"#ffffff",offense:77,defense:86,market:59}],ag=["PG","SG","SF","PF","C"],xl=["Jalen","Marcus","Theo","Darius","Cameron","Isaiah","Malik","Jordan","Eli","Andre","Noah","Devin","Xavier","Micah","Trey","Julian","Amari","Dominic","Caleb","Miles","Kai","Roman","Zion","Damon","Luca","Owen","Tyler","Evan","Jasper","Nico","Reese","Shawn","Victor","Wesley","Aaron","Brandon","Cole","Derek","Felix","Grant"],Ml=["Bennett","Carter","Brooks","Hayes","Walker","Turner","Reed","Morgan","Price","Bell","Foster","Coleman","Bryant","Griffin","Sanders","Hughes","Ward","Bailey","Rivera","Cooper","Richardson","Howard","Watts","Dixon","Hunt","Murray","Freeman","Wells","Webb","Barnes","Simmons","Patterson","Jenkins","Perry","Powell","Long","Washington","Butler","Russell","Stone"];function to(i){let e=2166136261;for(const t of String(i))e^=t.charCodeAt(0),e=Math.imul(e,16777619);return e>>>0}function Ot(i){let e=typeof i=="number"?i:to(i);return()=>{e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function we(i){return Mt.find(e=>e.id===i)||Mt[0]}function Hi(i){return Math.round((i.offense+i.defense)/2)}function yt(i,e=""){const t=i.name.replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase();return`<svg class="team-logo ${e}" viewBox="0 0 100 112" role="img" aria-label="${i.city} ${i.name} logo">
    <defs><linearGradient id="g-${i.id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${i.primary}"/><stop offset="1" stop-color="${i.secondary}"/></linearGradient></defs>
    <path d="M50 3 91 18 85 70Q79 94 50 108 21 94 15 70L9 18Z" fill="#07111f" stroke="${i.secondary}" stroke-width="2"/>
    <path d="M50 11 82 23 77 66Q71 86 50 98 29 86 23 66L18 23Z" fill="url(#g-${i.id})" opacity=".92"/>
    <path d="M27 68 69 26M30 78 78 30" stroke="${i.ink}" stroke-opacity=".16" stroke-width="8"/>
    <circle cx="50" cy="52" r="25" fill="#07111f" fill-opacity=".72" stroke="${i.ink}" stroke-opacity=".55"/>
    <path d="M25 52h50M50 27c-10 12-10 38 0 50M50 27c10 12 10 38 0 50" fill="none" stroke="${i.ink}" stroke-opacity=".28" stroke-width="1.5"/>
    <text x="50" y="60" text-anchor="middle" fill="${i.ink}" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="24" letter-spacing="-1">${t}</text>
  </svg>`}function dr(i,e="DYNASTY-2027"){const t=Ot(`${e}|roster|${i.id}`),n=new Set,s=[];for(let r=0;r<12;r++){let a="";do a=`${xl[Math.floor(t()*xl.length)]} ${Ml[Math.floor(t()*Ml.length)]}`;while(n.has(a));n.add(a);const o=r<5,c=o?Hi(i)+4-r:Hi(i)-7-Math.floor(r/3),l=Math.max(61,Math.min(96,c+Math.floor(t()*7)-3)),d=20+Math.floor(t()*16),h=ag[r%5];s.push({id:`${i.id}-${r}`,name:a,pos:h,number:r===0?0:Math.floor(t()*55)+1,age:d,overall:l,potential:Math.min(99,l+Math.max(0,27-d)+Math.floor(t()*7)),offense:Math.max(55,Math.min(99,l+Math.floor(t()*11)-4)),defense:Math.max(52,Math.min(99,l+Math.floor(t()*11)-5)),height:h==="PG"?`6'${1+Math.floor(t()*5)}"`:h==="SG"?`6'${4+Math.floor(t()*4)}"`:h==="SF"?`6'${6+Math.floor(t()*4)}"`:h==="PF"?`6'${8+Math.floor(t()*4)}"`:`6'${10+Math.floor(t()*4)}"`,salary:Math.round(Math.max(1.1,(l-58)**2*.018)*10)/10,years:1+Math.floor(t()*4),morale:65+Math.floor(t()*31),starter:o,skin:["#5b3326","#7a4a32","#9a6242","#bd8560","#d9a37e","#e4b996"][Math.floor(t()*6)],hair:["#111318","#251b17","#3b271d","#15100d"][Math.floor(t()*4)]})}return s}function _n(i,e){return sg(i,e)}function og(i){return rg(i)}function Pt(i){return`${i<0?"−":""}$${Math.abs(i).toFixed(1)}M`}const Fn={length:30,width:16.8},zs=1/60,lg=24;function no(i,e,t){const n=document.createElement("canvas");n.width=i,n.height=e;const s=n.getContext("2d");t(s,i,e);const r=new ch(n);return r.colorSpace=Xt,r.anisotropy=4,r}function cg(i){return no(1536,864,(e,t,n)=>{const s=Ot(`court-${i.id}`);e.fillStyle="#b97c45",e.fillRect(0,0,t,n);const r=n/42;for(let l=0;l<42;l++)for(let d=0;d<14;d++){const h=t/12,f=d*h-l%2*h/2,p=43+Math.floor(s()*12);e.fillStyle=`hsl(29 43% ${p}%)`,e.fillRect(f,l*r,h-2,r-1)}const a=e.createLinearGradient(0,0,t,n);a.addColorStop(0,"rgba(255,255,255,.15)"),a.addColorStop(.45,"rgba(255,255,255,0)"),a.addColorStop(1,"rgba(40,12,0,.14)"),e.fillStyle=a,e.fillRect(0,0,t,n);const o=t/Fn.length,c=n/Fn.width;e.strokeStyle="rgba(250,250,240,.92)",e.lineWidth=5,e.strokeRect(20,20,t-40,n-40),e.beginPath(),e.moveTo(t/2,20),e.lineTo(t/2,n-20),e.stroke(),e.beginPath(),e.arc(t/2,n/2,1.8*c,0,Math.PI*2),e.stroke();for(const l of[-1,1]){const d=l<0?20:t-20,h=5.8*o,f=4.9*c,p=l<0?d:d-h;e.fillStyle=`${i.primary}bb`,e.fillRect(p,n/2-f/2,h,f),e.strokeRect(p,n/2-f/2,h,f);const g=t/2+l*(Fn.length/2-1.6)*o;e.beginPath(),e.arc(g,n/2,1.25*c,0,Math.PI*2),e.stroke(),e.beginPath();const _=t/2+l*(Fn.length/2-6.75)*o;e.arc(_,n/2,6.75*c,l<0?-1.12:Math.PI-1.12,l<0?1.12:Math.PI+1.12),e.stroke()}e.save(),e.translate(t/2,n/2),e.rotate(-Math.PI/2),e.textAlign="center",e.textBaseline="middle",e.fillStyle="#07111faa",e.font="900 68px Arial",e.fillText(i.name.toUpperCase(),0,-6),e.fillStyle=i.ink,e.font="700 20px Arial",e.letterSpacing="8px",e.fillText(`${i.city.toUpperCase()}  •  BASKETBALL`,0,48),e.restore(),e.fillStyle=i.primary,e.fillRect(20,20,t-40,12),e.fillRect(20,n-32,t-40,12)})}function dg(i){return no(1024,320,(e,t,n)=>{e.fillStyle="#040a14",e.fillRect(0,0,t,n);const s=e.createLinearGradient(0,0,t,0);s.addColorStop(0,i.primary),s.addColorStop(1,i.secondary),e.fillStyle=s,e.fillRect(0,0,t,14),e.fillRect(0,n-10,t,10),e.fillStyle=i.ink,e.textAlign="center",e.font="900 54px Arial",e.fillText(i.city.toUpperCase(),t/2,85),e.font="900 94px Arial",e.fillText(i.name.toUpperCase(),t/2,190),e.fillStyle=i.secondary,e.font="700 26px Arial",e.fillText("THE FUTURE IS BUILT HERE",t/2,255)})}class hg{constructor(e,t){this.canvas=e,this.team=t,this.simT=0,this.acc=0,this.paused=!1,this.last=performance.now(),this.frames=0,this.fps=60,this.fpsStamp=this.last,this.renderer=new ig({canvas:e,antialias:!0,preserveDrawingBuffer:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.35:1.75)),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=Ol,this.renderer.shadowMap.autoUpdate=!1,this.renderer.shadowMap.needsUpdate=!0,this.renderer.toneMapping=Bl,this.renderer.toneMappingExposure=1.05,this.scene=new th,this.scene.background=new ze("#030812"),this.scene.fog=new Za("#030812",40,100),this.camera=new Yt(42,innerWidth/innerHeight,.1,180),this.camera.position.set(23,19,27),this.camera.lookAt(0,1,0),this.world=new en,this.scene.add(this.world),this.players=[],this.makeLights(),this.makeArena(),this.makePlayers(),this.setTeam(t),this.resize=this.resize.bind(this),addEventListener("resize",this.resize),this.resize(),this.renderer.setAnimationLoop(n=>this.tick(n))}makeLights(){this.scene.add(new ph(13229311,1707529,1.15));const e=new vh(16773333,2.5);e.position.set(-12,28,10),e.castShadow=!0,e.shadow.mapSize.set(1024,1024),e.shadow.camera.left=-25,e.shadow.camera.right=25,e.shadow.camera.top=25,e.shadow.camera.bottom=-25,e.shadow.bias=-4e-4,this.scene.add(e);for(const t of[-18,18]){const n=new gh(9428223,75,65,.42,.5,1.2);n.position.set(t,23,-14),n.target.position.set(0,0,0),this.scene.add(n,n.target)}}makeArena(){const e=new wt({color:462877,roughness:.82,metalness:.22}),t=new Ne(new Ht(Fn.length+2,.35,Fn.width+2),e);t.position.y=-.22,t.receiveShadow=!0,this.world.add(t),this.courtMaterial=new wt({roughness:.28,metalness:.08}),this.court=new Ne(new si(Fn.length,Fn.width),this.courtMaterial),this.court.rotation.x=-Math.PI/2,this.court.position.y=.01,this.court.receiveShadow=!0,this.world.add(this.court),this.makeHoops(),this.makeBowl(),this.makeJumbotron(),this.makeCrowd();const n=new wt({color:1192268,emissive:465451,emissiveIntensity:1.4});for(const s of[-18,18]){const r=new Ne(new Ht(56,1.05,.35),n);r.position.set(0,5.2,s),this.world.add(r)}for(const s of[-28,28]){const r=new Ne(new Ht(.35,1.05,36),n);r.position.set(s,5.2,0),this.world.add(r)}}makeHoops(){const e=new wt({color:14148331,metalness:.8,roughness:.22}),t=new wt({color:16735010,metalness:.5,roughness:.3}),n=new hh({color:14284031,transparent:!0,opacity:.28,roughness:.08,metalness:.1,side:hn});for(const s of[-1,1]){const r=new en,a=new Ne(new Nn(.15,.24,4.3,12),e);a.position.set(s*16,2.05,0),r.add(a);const o=new Ne(new Ht(2.8,.18,.18),e);o.position.set(s*14.8,3.75,0),r.add(o);const c=new Ne(new Ht(.12,1.8,3.05),n);c.position.set(s*13.5,3.65,0),r.add(c);const l=new lh(new dh(c.geometry),new rc({color:16777215}));l.position.copy(c.position),r.add(l);const d=new Ne(new Pi(.45,.045,10,28),t);d.rotation.x=Math.PI/2,d.position.set(s*12.9,3.05,0),r.add(d);for(let h=0;h<10;h++){const f=h/10*Math.PI*2,p=new Ne(new Nn(.008,.008,.6,4),new Ii({color:16119279}));p.position.set(s*12.9+Math.cos(f)*.4,2.76,Math.sin(f)*.4),p.rotation.z=Math.cos(f)*.15,r.add(p)}this.world.add(r)}}makeBowl(){const e=new wt({color:726822,roughness:.88});for(let t=0;t<4;t++){const n=1+t*1.45,s=12.2+t*2.1;for(const r of[-1,1]){const a=new Ne(new Ht(50-t*2,1.25,2.1),e);a.position.set(0,n,r*s),this.world.add(a)}for(const r of[-1,1]){const a=new Ne(new Ht(2.1,1.25,23+t*2),e);a.position.set(r*(s+4),n,0),this.world.add(a)}}}makeJumbotron(){this.boardMaterial=new Ii({toneMapped:!1});const e=new wt({color:132362,metalness:.65,roughness:.25}),t=new Ne(new Ht(8.6,3.4,5.4),e);t.position.set(0,12.8,0),this.world.add(t);for(const s of[-2.72,2.72]){const r=new Ne(new si(8.1,2.85),this.boardMaterial);r.position.set(0,12.8,s),r.rotation.y=s<0?Math.PI:0,this.world.add(r)}for(const s of[-4.32,4.32]){const r=new Ne(new si(4.9,2.85),this.boardMaterial);r.position.set(s,12.8,0),r.rotation.y=s>0?Math.PI/2:-Math.PI/2,this.world.add(r)}const n=new Ne(new Pi(5.2,.08,8,64),new Ii({color:5691903}));n.rotation.x=Math.PI/2,n.position.y=15,this.world.add(n)}makeCrowd(){const e=Ot("crowd-layout"),t=innerWidth<700?650:1200,n=new Qn(.13,.28,1,4),s=new An(.115,5,3),r=new wt({color:16777215,roughness:.86}),a=new wt({color:16777215,roughness:.9});this.crowd=new zo(n,r,t),this.crowdHeads=new zo(s,a,t);const o=new _t,c=new ze,l=[2638431,14542573,8004933,12491600,3569051,6699898,2303790,13227487,9913647],d=[5976870,8014386,10117698,12420448,14263166,14989718];this.crowdBase=[];for(let h=0;h<t;h++){const f=Math.floor(e()*4),p=h%4,g=e()*2-1,_=2+f*1.45+e()*.35,m=11.7+f*2.1+e()*.95;let u,E;p<2?(u=g*(23-f),E=(p===0?-1:1)*m):(u=(p===2?-1:1)*(m+4),E=g*(10+f));const T=.85+e()*.42;o.position.set(u,_,E),o.scale.setScalar(T),o.rotation.y=e()*Math.PI*2,o.updateMatrix(),this.crowd.setMatrixAt(h,o.matrix),this.crowd.setColorAt(h,c.setHex(l[Math.floor(e()*l.length)])),o.position.y=_+.37*T,o.scale.setScalar(T),o.updateMatrix(),this.crowdHeads.setMatrixAt(h,o.matrix),this.crowdHeads.setColorAt(h,c.setHex(d[Math.floor(e()*d.length)])),this.crowdBase.push({x:u,y:_,z:E,s:T})}this.crowd.instanceMatrix.needsUpdate=!0,this.crowdHeads.instanceMatrix.needsUpdate=!0,this.world.add(this.crowd,this.crowdHeads)}uniformTexture(e,t=0){return no(256,256,(n,s,r)=>{n.fillStyle=e.primary,n.fillRect(0,0,s,r);const a=n.createLinearGradient(0,0,s,0);a.addColorStop(0,"#00000055"),a.addColorStop(.22,"#ffffff12"),a.addColorStop(.7,"#ffffff05"),a.addColorStop(1,"#00000066"),n.fillStyle=a,n.fillRect(0,0,s,r),n.fillStyle=e.secondary,n.fillRect(0,0,15,r),n.fillRect(s-15,0,15,r),n.fillRect(0,0,s,12),n.strokeStyle=e.ink,n.lineWidth=5,n.beginPath(),n.moveTo(62,0),n.quadraticCurveTo(s/2,62,s-62,0),n.stroke(),n.textAlign="center",n.fillStyle=e.ink,n.font="900 25px Arial",n.fillText(e.short,s/2,70),n.font="900 116px Arial",n.fillText(String(t),s/2,190),n.font="700 13px Arial",n.fillText("BSCFD",s/2,224)})}makePlayers(){const e=new wt({color:16054010,roughness:.42}),t=new wt({color:15332863,roughness:.5});for(let n=0;n<10;n++){const s=n<5,r=n%5,a=new en,o=Ot(`athlete-${this.team.id}-${n}`),c=new wt({color:["#5b3326","#7a4a32","#9a6242","#bd8560","#d9a37e","#e4b996"][Math.floor(o()*6)],roughness:.68}),l=new wt({color:["#111318","#251b17","#3b271d"][Math.floor(o()*3)],roughness:.9}),d=new wt({color:s?this.team.primary:"#e6e9ef",roughness:.52}),h=new wt({color:s?this.team.primary:"#e6e9ef",roughness:.58}),f=new Ne(new Nn(.39,.34,.88,18),d);f.position.y=1.58,f.scale.z=.66,f.castShadow=!0,a.add(f);const p=new Ne(new An(.39,16,10),d);p.position.y=1.91,p.scale.set(1.12,.52,.68),a.add(p);const g=new Ne(new Nn(.34,.38,.42,16),h);g.position.y=1.02,g.scale.z=.72,a.add(g);const _=new Ne(new Pi(.35,.022,6,24),t);_.rotation.x=Math.PI/2,_.position.y=1.23,_.scale.z=.72,a.add(_);const m=new Ne(new Nn(.115,.13,.22,10),c);m.position.y=2.08,a.add(m);const u=new Ne(new An(.235,18,12),c);u.position.y=2.34,u.scale.y=1.12,u.castShadow=!0,a.add(u);const E=new Ne(new An(.241,18,10,0,Math.PI*2,0,Math.PI*.47),l);E.position.y=2.39,a.add(E);const T=new Ne(new An(.045,8,6),c);T.position.set(0,2.35,.229),a.add(T);const S=[],w=[],R=[];for(const N of[-.19,.19]){const B=new en;B.position.set(N,1.1,0);const X=new Ne(new Qn(.11,.32,3,7),c);X.position.y=-.22,B.add(X);const G=new en;G.position.y=-.45;const Y=new Ne(new Qn(.095,.3,3,7),c);Y.position.y=-.21,G.add(Y);const Z=new Ne(new Nn(.098,.1,.25,7),t);Z.position.y=-.41,G.add(Z);const $=new Ne(new Ht(.25,.15,.43),e);$.position.set(0,-.58,.09),G.add($),B.add(G),a.add(B),S.push(B),w.push(G)}for(const N of[-.44,.44]){const B=new en;B.position.set(N,1.88,0),B.rotation.z=N<0?-.09:.09;const X=new Ne(new Qn(.09,.3,3,7),c);X.position.y=-.25,B.add(X);const G=new en;G.position.y=-.48;const Y=new Ne(new Qn(.075,.28,3,7),c);Y.position.y=-.22,G.add(Y);const Z=new Ne(new An(.09,8,6),c);Z.position.y=-.46,G.add(Z),B.add(G),a.add(B),S.push(B),R.push(G)}const A=new en,L=new wt({color:13000483,roughness:.72});A.add(new Ne(new An(.18,18,12),L));const M=new Ii({color:3282187}),y=new Ne(new Pi(.181,.008,5,28),M),I=y.clone();I.rotation.y=Math.PI/2,A.add(y,I),A.position.set(.55,1.05,.1),a.add(A),a.scale.set(1.02+r*.025,1.01+r*.035,1.02+r*.025),a.userData={jersey:d,shorts:h,skin:c,hair:l,limbs:S,knees:w,elbows:R,ball:A,index:n,home:s},this.players.push(a),this.world.add(a)}}applyUniforms(){if(this.game)for(const e of this.players){const t=e.userData.home?"home":"away",n=this.game.teams[t],s=this.game.onCourt?.[t]||this.game.rosters[t],r=s[e.userData.index%5];e.userData.jersey.map&&e.userData.jersey.map.dispose(),e.userData.jersey.map=this.uniformTexture(n,r?.number??e.userData.index),e.userData.jersey.color.set("#ffffff"),e.userData.jersey.needsUpdate=!0,e.userData.shorts.color.set(n.primary),r&&(e.userData.skin.color.set(r.skin),e.userData.hair.color.set(r.hair))}}setTeam(e){this.team=e,this.courtMaterial.map&&this.courtMaterial.map.dispose(),this.courtMaterial.map=cg(e),this.courtMaterial.needsUpdate=!0,this.boardMaterial.map&&this.boardMaterial.map.dispose(),this.boardMaterial.map=dg(e),this.boardMaterial.needsUpdate=!0;for(const t of this.players)t.userData.jersey.map=null,t.userData.jersey.color.set(t.userData.home?e.primary:"#e8edf2"),t.userData.shorts.color.set(t.userData.home?e.primary:"#e8edf2")}setOpponent(e){for(const t of this.players)t.userData.home||(t.userData.jersey.color.set(e.primary),t.userData.shorts.color.set(e.primary))}setGame(e){this.game=e,this.mode="game",this.appliedLineupVersion=e.lineupVersion,this.renderer.shadowMap.autoUpdate=!1,this.renderer.shadowMap.needsUpdate=!0,this.applyUniforms()}setWarmup(){this.mode="warmup",this.game=null,this.renderer.shadowMap.autoUpdate=!1,this.renderer.shadowMap.needsUpdate=!0;for(const e of this.players)e.visible=!0,e.userData.ball.visible=!0}sampleGame(e){const t=this.game;if(!t)return;this.appliedLineupVersion!==t.lineupVersion&&(this.appliedLineupVersion=t.lineupVersion,this.applyUniforms());const n=t.state,s=n.possession,r=s==="home"?1:-1,a=[[2.7,0],[5.9,-5.2],[5.9,5.2],[8.7,-2.8],[10.4,2.1]],o=Math.floor(n.totalTime/3.2)%5,c=n.possessionLeft<1.6;for(const d of this.players){const h=d.userData.index,f=h%5,p=h<5?"home":"away",g=p===s,[_,m]=a[f],u=e*3+h*1.31,E=e*1.25+h*1.71,T=g?r*(_+Math.sin(E*.7)*.72):r*(_+1.1+Math.cos(E*.6)*.38),S=(g?m:-m*.92)+Math.sin(E)*.62,w=g&&f===o,R=w&&c?Math.sin(Math.min(1,(1.6-n.possessionLeft)/1.6)*Math.PI)*.3:0;d.position.set(T,R+Math.max(0,Math.sin(u*2))*.025-(g?0:.09),S),d.rotation.y=r*Math.PI/2;const{limbs:A,knees:L,elbows:M,ball:y}=d.userData;if(A[0].rotation.set(Math.sin(u)*.32,0,0),A[1].rotation.set(-Math.sin(u)*.32,0,0),L[0].rotation.x=Math.max(0,-Math.sin(u))*.55,L[1].rotation.x=Math.max(0,Math.sin(u))*.55,A[2].rotation.set(-Math.sin(u)*.24,0,-.09),A[3].rotation.set(Math.sin(u)*.24,0,.09),M[0].rotation.x=-.18,M[1].rotation.x=-.18,g||(A[2].rotation.z=-.72,A[3].rotation.z=.72,L[0].rotation.x=.38,L[1].rotation.x=.38),y.visible=w,w)if(c)if(A[2].rotation.x=-1.62,A[3].rotation.x=-1.62,M[0].rotation.x=-.48,M[1].rotation.x=-.48,n.possessionLeft>=1.05)y.position.set(.16,2.25,.4);else{const I=Math.max(0,Math.min(1,1-n.possessionLeft/1.05)),N=new O(d.position.x+r*.45,2.35+d.position.y,d.position.z),B=new O(r*12.9,3.05,0);N.lerp(B,I),N.y+=Math.sin(I*Math.PI)*3.1,d.updateMatrixWorld(!0),y.position.copy(d.worldToLocal(N))}else y.position.set(.48,.35+Math.abs(Math.sin(u*1.4))*1,.25),A[3].rotation.x=-.15+Math.sin(u*1.4)*.25,M[1].rotation.x=-.42}const l=innerWidth<700;if(t.lastEvent?.kind==="score"&&this.visualEvent!==t.lastEvent.id){this.visualEvent=t.lastEvent.id,this.highlightUntil=e+1.15;const d=t.lastEvent.side,h=(t.onCourt?.[d]||t.rosters[d]).findIndex(f=>f.id===t.lastEvent.playerId);this.highlightPlayer=this.players[(d==="home"?0:5)+Math.max(0,h)]}if(this.camera.fov=l?51:40,this.camera.updateProjectionMatrix(),!l&&e<this.highlightUntil&&this.highlightPlayer){const d=this.highlightPlayer;this.camera.position.set(d.position.x-r*3.8,4.8,d.position.z+8.8),this.camera.lookAt(d.position.x,1.35,d.position.z)}else this.camera.position.set(r*(l?15:14.5),l?13:12.2,l?23:22.5),this.camera.lookAt(r*4.7,1.05,0)}sample(e){if(this.mode==="game"){this.sampleGame(e);return}const t=e/lg*Math.PI*2,n=innerWidth<700,s=n?36:34;this.camera.position.set(Math.cos(.63+Math.sin(t)*.07)*s,n?23:19.5,Math.sin(.63+Math.sin(t)*.07)*s),this.camera.lookAt(0,1.1,0);for(const r of this.players){const a=r.userData.index,o=a%5,c=a<5?-1:1,l=e*1.35+a*1.71;r.position.set(c*(4.5+o*1.45)+Math.sin(l*.45)*.5,0,(o-2)*2.2+Math.cos(l*.35)*.35),r.rotation.y=c<0?-.7:.7,r.position.y=Math.max(0,Math.sin(l*2))*.045,r.userData.ball.position.y=.45+Math.abs(Math.sin(l*2.3))*1.2,r.userData.limbs[0].rotation.x=Math.sin(l)*.15,r.userData.limbs[1].rotation.x=-Math.sin(l)*.15}}tick(e){const t=Math.min((e-this.last)/1e3,.1);if(this.last=e,!this.paused){for(this.acc+=t;this.acc>=zs;)this.acc-=zs,this.simT+=zs,this.onStep&&this.onStep(zs);this.sample(this.simT)}this.mode==="game"&&this.frames%8===0&&(this.renderer.shadowMap.needsUpdate=!0),this.renderer.render(this.scene,this.camera),this.frames++,e-this.fpsStamp>=1e3&&(this.fps=Math.round(this.frames*1e3/(e-this.fpsStamp)),this.frames=0,this.fpsStamp=e)}resize(){const e=innerWidth,t=innerHeight;this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t,!1),this.sample(this.simT)}seek(e){this.paused=!0,this.acc=0,this.simT=Math.max(0,Number(e)||0),this.sample(this.simT),this.renderer.render(this.scene,this.camera)}play(){this.paused=!1,this.last=performance.now()}stats(){const e=this.renderer.getContext(),t=e.getExtension("WEBGL_debug_renderer_info");return{calls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,fps:this.fps,renderer:t?e.getParameter(t.UNMASKED_RENDERER_WEBGL):"WebGL"}}}const Gs=.2,ug=2880,Vs=720,fg=300,Ri=(i,e,t)=>Math.max(e,Math.min(t,i));function yl(i){return{id:i.id,name:i.name,pos:i.pos,number:i.number,points:0,fgm:0,fga:0,tpm:0,tpa:0,reb:0,ast:0,stl:0,tov:0,ftm:0,fta:0,seconds:0}}function Sl(){return{pace:50,focus:"balanced",defense:50}}function pg(i){const e=Math.max(0,Math.ceil(i));return`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`}function El(i){const e=[32,31,30,29,28,18,18,16,14,12,8,4],t=i.map((o,c)=>Math.max(0,o.targetMinutes??e[c]??4)),n=t.reduce((o,c)=>o+c,0)||240,s=t.map(o=>o*240/n),r=i.map(()=>0),a=[];for(let o=0;o<12;o++){let c;o===0?c=i.map((l,d)=>d).slice(0,5):c=i.map((l,d)=>d).sort((l,d)=>s[d]*(o+1)/12-r[d]-(s[l]*(o+1)/12-r[l])||l-d).slice(0,5);for(const l of c)r[l]+=4;a.push(c.map(l=>i[l].id))}return a}class _c{constructor({seed:e,homeTeam:t,awayTeam:n,homeRoster:s,awayRoster:r}){this.seed=e,this.homeTeam=t,this.awayTeam=n,this.teams={home:t,away:n},this.rosters={home:s.slice(0,12),away:r.slice(0,12)},this.random=Ot(`${e}|sim-v2|${t.id}|${n.id}`),this.state={period:1,clock:Vs,homeScore:0,awayScore:0,possession:"home",possessionLeft:14,totalTime:0,finished:!1,winner:null,eventSeq:0,timeouts:{home:4,away:4},momentum:{home:0,away:0}},this.tactics={home:Sl(),away:Sl()},this.stats={home:Object.fromEntries(this.rosters.home.map(a=>[a.id,yl(a)])),away:Object.fromEntries(this.rosters.away.map(a=>[a.id,yl(a)]))},this.rotationPlans={home:El(this.rosters.home),away:El(this.rosters.away)},this.segments={home:-1,away:-1},this.onCourt={home:[],away:[]},this.lineupVersion=0,this.events=[],this.shot=null,this.result=null,this.syncRotations(),this.emit("tip",`${t.city} ${t.name} vs. ${n.city} ${n.name}`,null,"neutral")}syncRotations(){const e=this.state.period<=4?(this.state.period-1)*Vs+(Vs-this.state.clock):ug;for(const t of["home","away"]){const n=Math.max(0,Math.min(11,Math.floor(e/240)));if(n===this.segments[t])continue;this.segments[t]=n;const s=this.rotationPlans[t][n];this.onCourt[t]=s.map(r=>this.rosters[t].find(a=>a.id===r)).filter(Boolean),this.lineupVersion++}}rand(){return this.random()}emit(e,t,n="home",s=e,r={}){const a={id:++this.state.eventSeq,type:e,kind:s,text:t,side:n,period:this.state.period,clock:this.state.clock,homeScore:this.state.homeScore,awayScore:this.state.awayScore,...r};return this.events.push(a),this.events.length>240&&this.events.shift(),this.lastEvent=a,a}setTactics(e,t){if(!this.tactics[e]||this.state.finished)return;const n=this.tactics[e];this.tactics[e]={pace:Ri(Number(t.pace??n.pace),0,100),focus:["balanced","outside","inside"].includes(t.focus)?t.focus:n.focus,defense:Ri(Number(t.defense??n.defense),0,100)}}callTimeout(e){return this.state.finished||this.state.timeouts[e]<=0?!1:(this.state.timeouts[e]--,this.state.momentum[e]=3,this.emit("timeout",`${this.teams[e].short} timeout · ${this.state.timeouts[e]} remaining`,e,"timeout"),!0)}step(){if(!this.state.finished){this.syncRotations();for(const e of["home","away"])for(const t of this.onCourt[e])this.stats[e][t.id].seconds+=Gs;if(this.state.totalTime+=Gs,this.state.clock-=Gs,this.state.possessionLeft-=Gs,this.state.clock<=0){this.endPeriod();return}this.state.possessionLeft<=0&&this.resolvePossession()}}endPeriod(){if(this.state.period>=4&&this.state.homeScore!==this.state.awayScore){this.finish();return}this.state.period++,this.state.clock=this.state.period>4?fg:Vs,this.state.possession=this.state.period%2?"away":"home",this.state.possessionLeft=14,this.emit("period",this.state.period>4?`Overtime ${this.state.period-4}`:`Start of period ${this.state.period}`,this.state.possession,"period")}finish(){this.state.clock=0,this.state.finished=!0,this.state.winner=this.state.homeScore>this.state.awayScore?"home":"away",this.emit("final",`Final · ${this.teams.home.short} ${this.state.homeScore}, ${this.teams.away.short} ${this.state.awayScore}`,this.state.winner,"final");const e=this.boxScore();this.result={homeScore:this.state.homeScore,awayScore:this.state.awayScore,winner:this.state.winner,period:this.state.period,checksum:this.checksum(),playerOfGame:[...e.home,...e.away].sort((t,n)=>n.points-t.points||n.reb-t.reb)[0]}}checksum(){const e={seed:this.seed,score:[this.state.homeScore,this.state.awayScore],period:this.state.period,events:this.events.map(t=>[t.type,t.side,t.text]),stats:this.boxScore()};return to(JSON.stringify(e)).toString(16).padStart(8,"0")}boxScore(){const e=t=>Object.values(this.stats[t]).map(n=>({...n,minutes:Math.floor(n.seconds/60)}));return{home:e("home"),away:e("away")}}playerOfGame(){return[...Object.values(this.stats.home),...Object.values(this.stats.away)].sort((e,t)=>t.points-e.points||t.reb-e.reb)[0]}newPossession(e,t=14){this.state.possession=e;const n=this.tactics[e].pace;this.state.possessionLeft=Ri(18-n*.075+this.rand()*4,7,19),this.shot=null,this.state.momentum[e]>0&&this.state.momentum[e]--}resolvePossession(){const e=this.state.possession,t=e==="home"?"away":"home",n=this.onCourt[e],s=this.tactics[e],r=this.tactics[t],a=n.map(A=>({p:A,weight:A.offense+(s.focus==="outside"&&["PG","SG","SF"].includes(A.pos)?12:0)+(s.focus==="inside"&&["PF","C"].includes(A.pos)?12:0)}));let o=this.rand()*a.reduce((A,L)=>A+L.weight,0),c=a[0].p;for(const A of a)if(o-=A.weight,o<=0){c=A.p;break}const l=this.onCourt[t],d=l.reduce((A,L)=>A+L.defense,0)/Math.max(1,l.length),h=this.stats[e][c.id],f=d+(r.defense-50)*.06,p=this.state.momentum[e]>0?3:0;if(this.rand()<Ri(.095+(f-80)*.0015-(s.pace-50)*25e-5,.055,.17)){h.tov++,this.emit("turnover",`${c.name} loses it · ${this.teams[t].short} ball`,t,"turnover",{playerId:c.id}),this.newPossession(t);return}let g="paint";const _=this.rand(),m=Ri(.31+(s.focus==="outside"?.14:0)+(s.focus==="inside"?-.1:0),.12,.55);_<m?g="three":_<m+.24&&(g="midrange");const u=g==="paint"?.105:.055;if(this.rand()<u){const A=g==="three"?3:2;let L=0;for(let M=0;M<A;M++)h.fta++,this.rand()<.72+(c.offense-80)*.002&&(h.ftm++,L++,this.state[`${e}Score`]++);h.points+=L,this.emit("foul",`${c.name} makes ${L} of ${A} free throws`,e,"score",{playerId:c.id,points:L}),this.newPossession(t);return}h.fga++,g==="three"&&h.tpa++;const E=g==="three"?.345:g==="midrange"?.455:.575,T=s.focus===g||s.focus==="outside"&&g==="three"||s.focus==="inside"&&g==="paint"?.025:0,S=Ri(E+(c.offense-80)*.0045-(f-80)*.0028+T+p*.006,.2,.76),w=this.rand()<S,R=w?g==="three"?3:2:0;if(this.shot={type:g,made:w,playerId:c.id,side:e,eventId:this.state.eventSeq+1},w){if(h.fgm++,g==="three"&&h.tpm++,h.points+=R,this.state[`${e}Score`]+=R,this.rand()<.62){const A=n.filter(M=>M.id!==c.id),L=A[Math.floor(this.rand()*A.length)];this.stats[e][L.id].ast++}this.emit("make",`${c.name} ${g==="three"?"from deep":g==="paint"?"finishes inside":"hits the jumper"} · +${R}`,e,"score",{playerId:c.id,points:R,shotType:g}),this.newPossession(t);return}if(this.emit("miss",`${c.name} misses the ${g==="three"?"three":g==="paint"?"layup":"jumper"}`,e,"miss",{playerId:c.id,shotType:g}),this.rand()<.23)h.reb++,this.state.possessionLeft=14,this.emit("rebound",`${c.name} tracks down the offensive board`,e,"rebound",{playerId:c.id});else{const A=this.onCourt[t][Math.floor(this.rand()*this.onCourt[t].length)];this.stats[t][A.id].reb++,this.newPossession(t)}}runToEnd(e=12e4){let t=0;for(;!this.state.finished&&t++<e;)this.step();if(!this.state.finished)throw new Error("Simulation tick limit reached");return this.result}snapshot(){return{...this.state,clockText:pg(this.state.clock),periodText:this.state.period>4?`OT${this.state.period-4}`:`Q${this.state.period}`,tactics:this.tactics,timeouts:{...this.state.timeouts}}}}function bl(i,e){const t=i.teams[e];return`<div class="score-team ${e}">${yt(t)}<span><small>${t.city.toUpperCase()}</small><b>${t.short}</b></span><strong id="${e}-score">${i.state[`${e}Score`]}</strong></div>`}function Zr(i,e,t){return`<button data-action="focus" data-focus="${e}" class="${t===e?"active":""}">${i}</button>`}function vc(i){const e=i.fixtureId||"";if(e.startsWith("R")){const t=Number(e.match(/^R(\d+)/)?.[1]||1);return t===1?"OPENING NIGHT":`REGULAR SEASON · GAME ${t}`}return e.startsWith("P")?`PLAYOFFS · GAME ${Number(e.match(/-G(\d+)$/)?.[1]||1)}`:"BSCFD EXHIBITION"}function mg(i,e=1,t=!1,n=!1){const s=i.snapshot(),r=i.teams.home,a=i.teams.away,o=i.userSide||"home",c=i.teams[o],l=i.tactics[o];return`<main class="simcast-screen screen" style="--team:${c.primary};--accent:${c.secondary}">
    <header class="sim-top"><div class="broadcast-mark"><span>BSCFD</span><b>LIVE</b></div><div class="sim-top-actions"><button class="sim-exit" data-action="audio-toggle" aria-label="Toggle arena audio">AUDIO · M</button><button class="sim-exit" data-action="exit-sim">EXIT TO HQ</button></div></header>
    <section class="scorebug">${bl(i,"away")}<div class="game-clock"><span id="period-text">${s.periodText}</span><b id="clock-text">${s.clockText}</b><small id="game-status">${t?"PAUSED":"SIMCAST"}</small></div>${bl(i,"home")}</section>
    <div class="broadcast-caption"><span>${vc(i)}</span><b>${a.city.toUpperCase()} AT ${r.city.toUpperCase()}</b><small>LEGENDARY ARENA</small></div>
    <section class="live-feed"><div class="feed-heading"><span><i></i> PLAY-BY-PLAY</span><b id="possession-label">${r.short} BALL</b></div><div id="event-feed" data-event="0"></div></section>
    <section class="live-leader"><span>PLAYER OF THE GAME</span><div id="leader-content"></div></section>
    <aside class="coach-panel ${n?"open":""}"><div class="coach-heading"><span>GM COACHING</span><button data-action="coach-toggle" aria-label="Close coaching">×</button></div><div class="coach-team">${yt(c)}<span><b>${c.name.toUpperCase()}</b><small>ADJUST THE NEXT POSSESSION</small></span></div>
      <label class="coach-label">SHOT SELECTION</label><div class="focus-control">${Zr("BALANCED","balanced",l.focus)}${Zr("OUTSIDE","outside",l.focus)}${Zr("INSIDE","inside",l.focus)}</div>
      <label class="range-label"><span>PACE</span><b id="pace-value">${l.pace}</b></label><input id="pace-input" data-tactic="pace" type="range" min="0" max="100" value="${l.pace}" aria-label="Offensive pace"><div class="range-ends"><span>CONTROL</span><span>PUSH</span></div>
      <label class="range-label"><span>DEFENSIVE PRESSURE</span><b id="defense-value">${l.defense}</b></label><input id="defense-input" data-tactic="defense" type="range" min="0" max="100" value="${l.defense}" aria-label="Defensive pressure"><div class="range-ends"><span>CONSERVE</span><span>ATTACK</span></div>
      <button class="timeout-button" data-action="timeout"><span>CALL TIMEOUT</span><b id="timeout-count">${s.timeouts[o]}</b></button><p class="coach-note">Timeouts create a three-possession momentum boost.</p>
    </aside>
    <button class="mobile-coach-button" data-action="coach-toggle">COACH</button>
    <section class="sim-controls"><button class="play-pause" data-action="pause-sim" aria-label="${t?"Resume":"Pause"}">${t?"▶":"Ⅱ"}</button><div class="speed-control">${[1,2,4,8].map(d=>`<button data-action="speed" data-speed="${d}" class="${e===d?"active":""}">${d}×</button>`).join("")}</div><button class="sim-end" data-action="sim-end">SIM TO END</button></section>
    <div id="result-host"></div><div id="sim-toast"></div>
  </main>`}function rr(i){const e=i.snapshot();for(const a of["home","away"]){const o=document.getElementById(`${a}-score`);o&&(o.textContent=e[`${a}Score`])}const t=(a,o)=>{const c=document.getElementById(a);c&&(c.textContent=o)};t("clock-text",e.clockText),t("period-text",e.periodText),t("possession-label",`${i.teams[e.possession].short} BALL`),t("timeout-count",e.timeouts[i.userSide||"home"]);const n=i.playerOfGame(),s=document.getElementById("leader-content");s&&n&&(i.teams.home.short===n.id.split("-")[0]||i.teams.home.id===n.id.slice(0,-2)?i.teams.home:i.teams.away,s.innerHTML=`<b>${n.name}</b><span>${n.points} PTS · ${n.reb} REB · ${n.ast} AST</span>`);const r=document.getElementById("event-feed");r&&Number(r.dataset.event)!==e.eventSeq&&(r.dataset.event=e.eventSeq,r.innerHTML=i.events.slice(-5).reverse().map(a=>`<div class="feed-event ${a.kind}"><span>${a.period>4?"OT":`Q${a.period}`} ${Math.floor(a.clock/60)}:${String(Math.floor(a.clock%60)).padStart(2,"0")}</span><p>${a.text}</p><b>${a.homeScore}–${a.awayScore}</b></div>`).join(""))}function xc(i){const e=i.result,t=i.teams.home,n=i.teams.away,s=i.teams[e.winner],r=e.playerOfGame,a=i.rosters.home.some(l=>l.id===r.id)?"home":"away",o=i.rosters[a].find(l=>l.id===r.id),c=i.teams[a];return`<div class="result-backdrop"></div><section class="result-card"><div class="result-kicker"><span>BSCFD</span><b>POSTGAME SHOW</b><small>FINAL · ${e.period>4?"OVERTIME":"REGULATION"}</small></div><div class="result-layout"><div class="result-star"><span>PLAYER<br>OF THE<br>GAME</span>${_n(o,c)}<b>${r.name}</b><small>${c.short} · ${r.pos} · #${r.number}</small></div><div class="result-main"><span class="eyebrow">${s.city.toUpperCase()} TAKES THE WIN</span><h2>${e.winner==="home"?"A STATEMENT<br>AT HOME.":vc(i).startsWith("PLAYOFFS")?"A ROAD WIN.<br>A LEGACY BUILT.":"A HARD-FOUGHT<br>ROAD WIN."}</h2><div class="final-teams"><div>${yt(n)}<b>${n.short}</b><strong>${e.awayScore}</strong></div><span>FINAL</span><div>${yt(t)}<b>${t.short}</b><strong>${e.homeScore}</strong></div></div><div class="game-mvp"><span>${r.name.toUpperCase()} · FINAL LINE</span><b>${r.points}<small>PTS</small> ${r.reb}<small>REB</small> ${r.ast}<small>AST</small></b></div></div></div><div class="result-banner">${s.city.toUpperCase()} WINS · REPLAY CHECKSUM ${e.checksum}</div><div class="result-actions"><button class="button secondary" data-action="box-score">BOX SCORE</button><button class="button primary" data-action="return-hub">RETURN TO HQ</button></div></section>`}function gg(i){const e=i.boxScore(),t=n=>`<div class="box-table"><h3>${i.teams[n].city} ${i.teams[n].name}</h3><div class="box-row box-head"><span>PLAYER</span><span>PTS</span><span>REB</span><span>AST</span><span>FG</span><span>3PT</span></div>${e[n].sort((s,r)=>r.points-s.points).map(s=>`<div class="box-row"><span><b>${s.name}</b><small>${s.pos}</small></span><strong>${s.points}</strong><span>${s.reb}</span><span>${s.ast}</span><span>${s.fgm}/${s.fga}</span><span>${s.tpm}/${s.tpa}</span></div>`).join("")}</div>`;return`<div class="box-backdrop" data-action="close-box"></div><section class="box-modal"><button class="icon-button modal-close" data-action="close-box">×</button><span class="eyebrow">OFFICIAL BOX SCORE</span><h2>${i.teams.away.short} ${i.state.awayScore} · ${i.teams.home.short} ${i.state.homeScore}</h2>${t("away")}${t("home")}<button class="button primary" data-action="close-box">BACK TO RESULT</button></section>`}const di=112,ar=[32,31,30,29,28,18,18,16,14,12,8,4],zi=(i,e,t)=>Math.max(e,Math.min(t,i)),oi=i=>Math.round(i*10)/10,hi=i=>oi(i.reduce((e,t)=>e+t.salary,0));function Tl(i,e,t){const n={...Mt[0],id:`${e}-class`,offense:t,defense:t};return dr(n,`${i}|${e}`).map((s,r)=>({...s,id:`${e}-${r}`,starter:!1,years:0,ask:oi(Math.max(2.1,s.salary*.82)),morale:70+r%18}))}function Mc(i){return{rosters:Object.fromEntries(Mt.map(t=>{const n=dr(t,i),s=[...n].sort((r,a)=>r.age-a.age||r.id.localeCompare(a.id))[0];return s.rookie=!0,s.rookieYear=2027,[t.id,n]})),rotations:Object.fromEntries(Mt.map(t=>[t.id,[...ar]])),freeAgents:[...Tl(i,"veteran",76),...Tl(i,"prospect",69)],tradeLog:[],transactions:0}}function Ft(i){i.league?.rosters||(i.league=Mc(i.seed));for(const e of Mt)i.league.rotations[e.id]?.length||(i.league.rotations[e.id]=[...ar]),i.league.rotations[e.id]=i.league.rosters[e.id].map((t,n)=>i.league.rotations[e.id][n]??ar[n]??4);return i.league}function Kt(i,e){return Ft(i).rosters[e]}function yc(i,e){const t=Kt(i,e),n=Ft(i).rotations[e];return t.filter(s=>(i.injuries[s.id]||0)<=0).map(s=>{const r=t.findIndex(o=>o.id===s.id),a=(s.morale-75)*.045;return{...s,targetMinutes:n[r]??8,offense:zi(Math.round(s.offense+a),45,99),defense:zi(Math.round(s.defense+a),45,99)}})}function _g(i,e,t,n){const s=Ft(i),r=s.rosters[e],a=s.rotations[e],o=r.findIndex(u=>u.id===t);if(o<0)return!1;const c=zi(Math.round(Number(n)),0,40),l=a[o],d=c-l;if(!d)return!0;const h=a.map((u,E)=>E).filter(u=>u!==o);let f=Math.abs(d);for(let u=0;u<3&&f>0;u++){const E=w=>d>0?a[w]:40-a[w],T=h.reduce((w,R)=>w+E(R),0);if(!T)break;for(const w of h){const R=Math.min(E(w),f*E(w)/T);a[w]+=d>0?-R:R}const S=a.reduce((w,R)=>w+R,0);a[o]=c,f=Math.abs(240-S)}a[o]=c;let p=a.map(u=>Math.round(u)),g=240-p.reduce((u,E)=>u+E,0),_=0;for(;g!==0&&_<100;){const u=(o+1+_)%a.length,E=Math.sign(g);p[u]+E>=0&&p[u]+E<=40&&(p[u]+=E,g-=E),_++}s.rotations[e]=p,s.rotations[e][o]=c;const m=240-s.rotations[e].reduce((u,E)=>u+E,0);if(m){const u=s.rotations[e].map((E,T)=>({i:T,v:E})).filter(E=>E.i!==o).sort((E,T)=>m>0?T.v-E.v:E.v-T.v)[0].i;s.rotations[e][u]+=m}return!0}function vg(i,e,t){const n=Kt(i,e),s=n.findIndex(c=>c.id===t);if(s<0)return!1;if(s<5)return!0;const[r]=n.splice(s,1);n.splice(4,0,r);const a=Ft(i).rotations[e],[o]=a.splice(s,1);return a.splice(4,0,o),r.starter=!0,n.forEach((c,l)=>c.starter=l<5),!0}function Al(i,e,t,n){const s=Kt(i,e),r=[...s].sort((o,c)=>c.overall-o.overall),a=[];for(const o of s){const c=t.find(g=>g.id===o.id),l=r.findIndex(g=>g.id===o.id),d=l<5?27:l<8?15:7,h=c?.minutes||0,f=zi((h-d)*.055,-1.4,1)+(n?.35:-.18),p=o.morale;o.morale=zi(oi(o.morale+f),35,99),o.morale!==p&&a.push({playerId:o.id,delta:oi(o.morale-p)})}return a}function Sc(i,e){const t=Kt(i,e);return Math.round(t.reduce((n,s)=>n+s.morale,0)/t.length)}function Ec(i,e){const t=Ft(i),n=t.rosters[e],s=Math.floor((i.round||0)/6),r=Ot(`${i.seed}|${i.year}|${e}|trade|${s}`),a=[],o=Mt.filter(d=>d.id!==e),c=di-hi(n),l=new Set;for(let d=0;d<3;d++){let h=o[Math.floor(r()*o.length)];for(;l.has(h.id);)h=o[(o.findIndex(u=>u.id===h.id)+1)%o.length];l.add(h.id);const f=n[5+(s+d*2)%Math.min(6,n.length-5)],g=[...t.rosters[h.id]].filter(u=>u.pos===f.pos&&Math.abs(u.overall-f.overall)<=5&&u.salary-f.salary<=c).sort((u,E)=>Math.abs(u.overall-f.overall)-Math.abs(E.overall-f.overall)||u.id.localeCompare(E.id))[0];if(!g)continue;const _=g.age<f.age,m=g.overall>f.overall;a.push({id:`${i.year}-${s}-${e}-${h.id}-${f.id}-${g.id}`,partnerId:h.id,giveId:f.id,receiveId:g.id,reason:_?`${we(h.id).city} offers youth for your proven rotation player.`:m?`${we(h.id).city} needs ${f.name}'s ${f.pos} skill set for a playoff push.`:`A like-for-like ${f.pos} swap balances both rotations.`,fit:Math.round((g.offense+g.defense)/2),salaryDelta:oi(g.salary-f.salary)})}return a}function xg(i,e,t){const n=Ft(i),s=Ec(i,e).find(h=>h.id===t);if(!s)return{ok:!1,reason:"This offer is no longer available."};const r=n.rosters[e],a=n.rosters[s.partnerId],o=r.find(h=>h.id===s.giveId),c=a.find(h=>h.id===s.receiveId);if(!o||!c)return{ok:!1,reason:"A player in this offer has moved."};if(hi(r)-o.salary+c.salary>di)return{ok:!1,reason:"The incoming salary would put you over the cap."};const l=r.indexOf(o),d=a.indexOf(c);return r[l]=c,a[d]=o,c.starter=l<5,o.starter=d<5,n.tradeLog.unshift({id:s.id,year:i.year,round:i.round,teamId:e,partnerId:s.partnerId,giveId:o.id,receiveId:c.id,reason:s.reason}),n.transactions++,{ok:!0,offer:s,give:o,receive:c}}function bc(i){return{salary:oi(i.salary*1.12),years:3}}function Mg(i,e,t){const n=Kt(i,e),s=n.find(a=>a.id===t);if(!s)return{ok:!1,reason:"Player not found."};if(s.years>2)return{ok:!1,reason:"This contract is not yet eligible for an extension."};const r=bc(s);return hi(n)-s.salary+r.salary>di?{ok:!1,reason:"Not enough cap room for this extension."}:(s.salary=r.salary,s.years=r.years,s.morale=zi(s.morale+6,35,99),Ft(i).transactions++,{ok:!0,player:s})}function yg(i,e,t,n){const s=Ft(i),r=s.rosters[e],a=s.freeAgents.find(h=>h.id===t),o=r.find(h=>h.id===n);if(!a||!o)return{ok:!1,reason:"Choose a free agent and a player to release."};const c=a.ask;if(hi(r)-o.salary+c>di)return{ok:!1,reason:"That combination exceeds the $112.0M salary cap."};const l=r.indexOf(o),d={...a,salary:c,years:2,starter:o.starter,morale:78};return r[l]=d,s.freeAgents.splice(s.freeAgents.indexOf(a),1),o.years=0,o.ask=oi(Math.max(2.1,o.salary*.8)),s.freeAgents.push(o),s.transactions++,{ok:!0,signed:d,outgoing:o}}const Sg=["FIRST ROUND","CONFERENCE SEMIFINALS","CONFERENCE FINALS","THE FINALS"],Eg=(i,e)=>i.reduce((t,n)=>t+(n[e]||0),0),wl=(i,e)=>i+e?i/(i+e):0;function bg(i){return Mt.findIndex(e=>e.id===i)<15?"EAST":"WEST"}function Tc(i){return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",timeZone:"UTC"}).format(new Date(i)).toUpperCase()}function Tg(i=2027){const e=Mt.map(r=>r.id),t=[],n=[...e];for(let r=0;r<29;r++){const a=[];for(let o=0;o<15;o++){const c=n[o],l=n[29-o],d=(r+o)%2===0;a.push({homeId:d?c:l,awayId:d?l:c})}t.push(a),n.splice(1,0,n.pop())}const s=[];for(let r=0;r<82;r++){const a=t[r%29],o=r>=29&&r<58,c=a.map((l,d)=>({id:`R${r+1}-G${d+1}`,round:r,homeId:o?l.awayId:l.homeId,awayId:o?l.homeId:l.awayId,date:Date.UTC(i-1,9,15+r*2+1),played:!1}));s.push({round:r,date:c[0].date,games:c})}return s}function Ag(){return Object.fromEntries(Mt.map(i=>[i.id,{wins:0,losses:0,pointsFor:0,pointsAgainst:0,streak:0}]))}function wg(){return{gp:0,points:0,reb:0,ast:0,stl:0,tov:0,fgm:0,fga:0,tpm:0,tpa:0,seconds:0}}function Rg(i,e){for(const t of["home","away"])for(const n of e[t]){if(n.seconds<=0)continue;const s=i.playerStats[n.id]||wg();s.gp++;for(const r of["points","reb","ast","stl","tov","fgm","fga","tpm","tpa","seconds"])s[r]+=n[r]||0;i.playerStats[n.id]=s}}function Rl(i,e){return yc(i,e)}function Ac(i,e,t,n){if(i.results[e.id])return;const s=i.records[e.homeId],r=i.records[e.awayId],a=t.homeScore>t.awayScore;e.seriesId||(s.wins+=a?1:0,s.losses+=a?0:1,r.wins+=a?0:1,r.losses+=a?1:0,s.pointsFor+=t.homeScore,s.pointsAgainst+=t.awayScore,r.pointsFor+=t.awayScore,r.pointsAgainst+=t.homeScore,s.streak=a?Math.max(1,s.streak+1):Math.min(-1,s.streak-1),r.streak=a?Math.min(-1,r.streak-1):Math.max(1,r.streak+1)),i.results[e.id]={...e,homeScore:t.homeScore,awayScore:t.awayScore,winnerId:a?e.homeId:e.awayId,period:t.period,checksum:t.checksum},Rg(i,n),Al(i,e.homeId,n.home,a),Al(i,e.awayId,n.away,!a)}function wc(i,e,t){const n=Ot(`${i.seed}|${i.year}|${e.id}|injuries`);for(const s of["home","away"]){const r=e[`${s}Id`];if(n()<.022){const a=t[s],o=a[Math.floor(n()*a.length)],c=2+Math.floor(n()*7);o&&(i.injuries[o.id]=c,i.injuryLog.unshift({id:`${e.id}-${s}`,playerId:o.id,name:o.name,teamId:r,games:c,round:e.round??-1}))}}}function io(i,e){if(i.results[e.id])return i.results[e.id];const t=Rl(i,e.homeId),n=Rl(i,e.awayId),s=new _c({seed:`${i.seed}|${i.year}|${e.id}`,homeTeam:we(e.homeId),awayTeam:we(e.awayId),homeRoster:t,awayRoster:n}),r=s.runToEnd(),a=s.boxScore();return Ac(i,e,r,a),wc(i,e,a),i.results[e.id]}function Cg(i){for(const e of Object.keys(i.injuries))i.injuries[e]--,i.injuries[e]<=0&&delete i.injuries[e]}function Ig(i){const e=Mt.flatMap(o=>Kt(i,o.id).map(c=>({player:c,team:o,stats:i.playerStats[c.id]}))).filter(o=>o.stats?.gp>=20),t=(o,c)=>o.stats[c]/o.stats.gp,n=[...e].sort((o,c)=>t(c,"points")+t(c,"reb")*.7+t(c,"ast")*.8+i.records[c.team.id].wins*.025-(t(o,"points")+t(o,"reb")*.7+t(o,"ast")*.8+i.records[o.team.id].wins*.025))[0],s=[...e].sort((o,c)=>c.player.defense+t(c,"reb")+t(c,"stl")*3-(o.player.defense+t(o,"reb")+t(o,"stl")*3))[0],r=[...e].filter(o=>o.player.rookie===!0&&o.player.rookieYear===i.year).sort((o,c)=>t(c,"points")-t(o,"points"))[0]||n,a=o=>({playerId:o.player.id,name:o.player.name,teamId:o.team.id,points:+(o.stats.points/o.stats.gp).toFixed(1),reb:+(o.stats.reb/o.stats.gp).toFixed(1),ast:+(o.stats.ast/o.stats.gp).toFixed(1)});return{mvp:a(n),defensive:a(s),rookie:a(r)}}function Pg(i){const e=[];for(const t of["EAST","WEST"]){const n=fr(i,t);[[0,7],[3,4],[2,5],[1,6]].forEach(([r,a],o)=>e.push(Ha(i,0,t,o,n[r].id,n[a].id)))}i.playoffs={round:0,series:e,championId:null},i.phase="playoffs"}function Ha(i,e,t,n,s,r){return{id:`P${e}-${t}-${n}`,round:e,conference:t,index:n,homeId:s,awayId:r,homeWins:0,awayWins:0,gameNo:0,winnerId:null,games:[]}}function Rc(i){const e=i.gameNo,t=[0,1,4,6].includes(e)?i.homeId:i.awayId;return{id:`${i.id}-G${e+1}`,seriesId:i.id,homeId:t,awayId:t===i.homeId?i.awayId:i.homeId,date:Date.UTC(2027,3,18+e*2),played:!1}}function Cc(i,e){if(e.winnerId)return;const t=Rc(e),n=io(i,t);e.gameNo++,n.winnerId===e.homeId?e.homeWins++:e.awayWins++,e.games.push(n.id),(e.homeWins===4||e.awayWins===4)&&(e.winnerId=e.homeWins===4?e.homeId:e.awayId)}function Lg(i){const e=i.playoffs;if(!e||e.series.some(r=>!r.winnerId))return;if(e.round===3){e.championId=e.series[0].winnerId,i.phase="complete";return}const t=e.series,n=e.round+1,s=[];if(n<3)for(const r of["EAST","WEST"]){const a=t.filter(c=>c.conference===r).sort((c,l)=>c.index-l.index).map(c=>c.winnerId);(n===1?[[a[0],a[3]],[a[1],a[2]]]:[[a[0],a[1]]]).forEach(([c,l],d)=>{const[h,f]=Cl(i,c,l);s.push(Ha(i,n,r,d,h,f))})}else{const[r,a]=t.map(l=>l.winnerId),[o,c]=Cl(i,r,a);s.push(Ha(i,3,"FINALS",0,o,c))}e.round=n,e.series=s}function Cl(i,e,t){const n=fr(i);return n.findIndex(s=>s.id===e)<n.findIndex(s=>s.id===t)?[e,t]:[t,e]}function Ic(i){Cg(i),i.phase==="regular"?(i.round++,i.round>=82&&Dg(i)):Lg(i)}function Dg(i){i.awards=Ig(i),Pg(i)}function so(i,e=2027){return{seed:i,year:e,phase:"regular",round:0,schedule:Tg(e),records:Ag(),results:{},playerStats:{},injuries:{},injuryLog:[],awards:null,playoffs:null,league:Mc(i)}}function hr(i,e){if(i.phase==="regular")return i.schedule[i.round]?.games.find(t=>t.homeId===e||t.awayId===e)||null;if(i.phase==="playoffs"){const t=i.playoffs.series.find(n=>(n.homeId===e||n.awayId===e)&&!n.winnerId);return t?{...Rc(t),series:t}:null}return null}function Ug(i,e,t){const n=hr(i,e);if(!n||!t.result||!(t.homeTeam.id===n.homeId&&t.awayTeam.id===n.awayId))return null;if(Ac(i,n,t.result,t.boxScore()),wc(i,n,t.boxScore()),i.phase==="regular")for(const r of i.schedule[i.round].games)r.id!==n.id&&io(i,r);else{const r=i.playoffs.series.find(a=>a.id===n.seriesId);t.result.winner==="home"?r.homeWins++:r.awayWins++,r.gameNo++,r.games.push(n.id),(r.homeWins===4||r.awayWins===4)&&(r.winnerId=r.homeWins===4?r.homeId:r.awayId);for(const a of i.playoffs.series)a.id!==r.id&&Cc(i,a)}return Ic(i),i.results[n.id]}function ur(i,e){if(i.phase==="complete")return null;const t=hr(i,e);if(i.phase==="regular")for(const n of i.schedule[i.round].games)io(i,n);else for(const n of i.playoffs.series)Cc(i,n);return Ic(i),t?i.results[t.id]:null}function Ng(i){for(;i.phase==="regular";)ur(i,null);return i.awards}function Og(i){for(;i.phase==="playoffs";)ur(i,null);return i.playoffs?.championId}function fr(i,e=null){return Mt.filter(t=>!e||bg(t.id)===e).map(t=>({...t,...i.records[t.id],diff:i.records[t.id].pointsFor-i.records[t.id].pointsAgainst})).sort((t,n)=>wl(n.wins,n.losses)-wl(t.wins,t.losses)||n.diff-t.diff||n.wins-t.wins||t.id.localeCompare(n.id))}function pr(i){return to(JSON.stringify({seed:i.seed,results:Object.values(i.results).sort((e,t)=>e.id.localeCompare(t.id)).map(e=>[e.id,e.homeScore,e.awayScore]),awards:i.awards,champion:i.playoffs?.championId})).toString(16).padStart(8,"0")}function mr(i){return Sg[i]||"PLAYOFFS"}function Fg(i){return{games:Object.keys(i.results).length,injuries:Object.keys(i.injuries).length,points:Eg(Object.values(i.records),"pointsFor")}}const wn=(i,e,t)=>Math.max(e,Math.min(t,i)),Zs=i=>Math.round(i*10)/10;function li(i){return i.dynasty||={number:Math.max(1,i.year-2026),history:[],titles:0,playoffAppearances:0,championships:[],transactions:0},i.dynasty.history||=[],i.dynasty.championships||=[],i.dynasty}function Bg(i){const e=fr(i).map(n=>n.id),t=i.playoffs?.championId;return[...e.filter(n=>n!==t).reverse(),...t?[t]:[]]}function kg(i,e){const t=[];for(let n=0;n<60;n++){const s=dr(Mt[n%30],`${i}|draft|${e}|${Math.floor(n/30)}`)[Math.floor(n/30)],r=Ot(`${i}|prospect|${e}|${n}`),a=56+Math.floor(r()*24);t.push({...s,id:`rookie-${e}-${n}`,age:19+Math.floor(r()*4),overall:a,potential:wn(a+4+Math.floor(r()*20),65,99),offense:wn(a+Math.floor(r()*9)-4,48,95),defense:wn(a+Math.floor(r()*9)-4,48,95),salary:Zs(1.2+(60-n)*.075),years:3,morale:80,starter:!1,rookie:!0,draftYear:null,draftPick:null,draftedBy:null,prospectTeam:Mt[n%30].id})}return t}function Hg(i,e){if(i.phase!=="complete")return{ok:!1,reason:"Finish the championship first."};const t=li(i),n=i.records[e],s=i.playoffs.championId;t.history.some(a=>a.year===i.year)||t.history.push({year:i.year,teamId:e,wins:n.wins,losses:n.losses,championId:s,userChampion:s===e,mvp:i.awards?.mvp?.name||null,checksum:pr(i)}),t.titles=t.history.filter(a=>a.userChampion).length,t.playoffAppearances=t.history.filter(a=>a.teamId===e).length,s===e&&!t.championships.includes(i.year)&&t.championships.push(i.year);const r=Bg(i);return i.offseason={stage:"scouting",scoutingPoints:8,scouted:[],order:r,pick:0,draftClass:kg(i.seed,i.year+1),draftLog:[],startedYear:i.year+1},i.phase="offseason",{ok:!0,offseason:i.offseason}}function zg(i,e){const t=i.offseason,n=t?.draftClass.find(s=>s.id===e);return!t||t.stage!=="scouting"||!n?{ok:!1,reason:"This prospect is not available to scout."}:t.scouted.includes(e)?{ok:!0,player:n,already:!0}:t.scoutingPoints<1?{ok:!1,reason:"No scouting visits remain."}:(t.scoutingPoints--,t.scouted.push(e),{ok:!0,player:n})}function Js(i,e){const t=i.offseason?.scouted.includes(e.id),n=Ot(`${i.seed}|scout-grade|${e.id}`),s=wn(e.overall+Math.floor(n()*9)-4,45,99);return{scouted:t,overall:t?e.overall:s,potential:t?e.potential:null,offense:t?e.offense:null,defense:t?e.defense:null,label:t?"FULL REPORT":"REGIONAL REPORT"}}function Gg(i,e){const t=i.offseason;return!t||t.stage!=="scouting"?{ok:!1,reason:"The draft is not ready."}:(t.stage="draft",Lc(i,e),{ok:!0,currentTeamId:t.order[t.pick]})}function Vg(i,e){const t=i.offseason,n=Kt(i,e),s=Ot(`${i.seed}|${i.year}|ai-draft|${e}`),r=Object.fromEntries(["PG","SG","SF","PF","C"].map(a=>[a,n.filter(o=>o.pos===a).length]));return t.draftClass.filter(a=>!a.draftedBy).map(a=>({player:a,score:a.overall+a.potential*.18-r[a.pos]*1.4+s()*2})).sort((a,o)=>o.score-a.score||a.player.id.localeCompare(o.player.id))[0]?.player}function Pc(i,e,t){const n=i.offseason,s=n.pick+1,r=Kt(i,e),a=Math.min(11,r.length);t.draftedBy=e,t.draftYear=n.startedYear,t.draftPick=s,t.rookie=!0,t.rookieYear=n.startedYear,t.starter=!1,r.push(t),Ft(i).rotations[e].splice(a,0,6),n.draftLog.push({pick:s,year:n.startedYear,teamId:e,playerId:t.id,name:t.name,overall:t.overall,pos:t.pos}),n.pick++}function $g(i,e,t){const n=i.offseason;if(!n||n.stage!=="draft")return{ok:!1,reason:"Complete the draft first."};if(n.order[n.pick]!==e)return{ok:!1,reason:"It is not your pick."};const s=n.draftClass.find(r=>r.id===t&&!r.draftedBy);return s?(Pc(i,e,s),Lc(i,e,!0),n.stage="review",{ok:!0,player:s,pick:n.draftLog.findLast(r=>r.playerId===t)?.pick}):{ok:!1,reason:"That prospect has already been selected."}}function Lc(i,e,t=!1){const n=i.offseason;if(!(!n||n.stage!=="draft")){for(;n.pick<n.order.length&&(t||n.order[n.pick]!==e);){const s=n.order[n.pick],r=Vg(i,s);if(!r)break;Pc(i,s,r)}n.pick>=n.order.length&&(n.stage="review")}}function Wg(i,e){const t=i.offseason;if(!t||t.stage!=="review")return{ok:!1,reason:"Make your draft selection first."};const n=i.year,s=Ft(i),r=Ot(`${i.seed}|${n}|development`),a=[];for(const l of Mt){const d=Kt(i,l.id),h=[];for(const p of d){const g=p.overall;p.age++,p.years=Math.max(0,(p.years||1)-1);const _=p.age<=23?2:p.age<=26?1:p.age<=29?0:p.age<=32?-1:p.age<=34?-2:-3,m=Math.floor(r()*3)-1,u=wn(_+m,-4,4);p.overall=wn(p.overall+u,45,99),p.offense=wn(p.offense+u,45,99),p.defense=wn(p.defense+u,45,99),p.potential=Math.max(p.potential,p.overall),p.development=p.overall-g,p.morale=wn(p.morale+(u>0?3:0),35,99),p.years===0&&(p.ask=Zs(Math.max(2.1,p.salary*.92)),h.push(p)),p.age>=38&&(p.retired=!0,a.push(`${p.name} retires after a legendary career.`))}s.freeAgents.push(...h.filter(p=>!p.retired));let f=d.filter(p=>p.years>0&&!p.retired);for(;f.length>12;){const p=f.filter(g=>!g.rookie||g.draftYear!==t.startedYear).sort((g,_)=>g.overall-_.overall||_.age-g.age)[0]||f[0];p.ask=Zs(Math.max(2.1,p.salary*.8)),p.years=0,s.freeAgents.push(p),f.splice(f.indexOf(p),1),a.push(`${l.city} waives ${p.name} to make room for its rookie.`)}for(;f.length<12;){const p=t.draftClass.filter(_=>!_.draftedBy&&!_.signedBy).sort((_,m)=>m.overall-_.overall||_.id.localeCompare(m.id))[0],g=p||h.filter(_=>!_.retired&&!_.reSigned).sort((_,m)=>m.overall-_.overall||_.id.localeCompare(m.id))[0];if(!g)break;g.reSigned=!p,g.years=2,g.salary=p?1.2:Zs(g.ask),p&&(g.signedBy=l.id,g.rookie=!0,g.rookieYear=t.startedYear),f.push(g),a.push(`${l.city} ${p?"signs undrafted rookie":"brings back"} ${g.name}.`)}f.sort((p,g)=>g.overall-p.overall),f.forEach((p,g)=>p.starter=g<5),s.rosters[l.id]=f,s.rotations[l.id]=f.map((p,g)=>ar[g]??4)}const o=li(i).history,c=so(i.seed,n+1);c.league=s,c.league.freeAgents=c.league.freeAgents.slice(-60),c.dynasty=li(i),c.dynasty.number++,c.dynasty.lastOffseason={year:n,draftLog:t.draftLog,news:a};for(const l of Object.keys(i))delete i[l];return Object.assign(i,c),{ok:!0,year:i.year,history:o}}function Dc(i,e){const t=li(i),n=t.history.filter(s=>s.teamId===e);return{seasons:n.length,wins:n.reduce((s,r)=>s+r.wins,0),losses:n.reduce((s,r)=>s+r.losses,0),titles:n.filter(s=>s.userChampion).length,championships:t.championships}}function Xg(i){return JSON.stringify({...i,exportedAt:new Date().toISOString(),format:"BSCFD-DYNASTY"},null,2)}function Yg(i){if(!i||typeof i.seed!="string"||!Mt.some(e=>e.id===i.teamId)||!i.season?.league?.rosters||i.season.schedule?.length!==82)throw new Error("Choose a valid BSCFD dynasty save.");for(const e of Mt)if(!Array.isArray(i.season.league.rosters[e.id]))throw new Error("The roster file is incomplete.");return i}const qg='<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 18 6-6-6-6"/></svg>',os=(i,e,t="primary",n="")=>`<button class="button ${t}" data-action="${e}" ${n}>${i}${t==="primary"?qg:""}</button>`;function jg(i,e,t){const n=Js(i,e),s=i.offseason,r=we(e.prospectTeam),a=s.stage==="draft";return`<article class="prospect-card ${n.scouted?"scouted":""}"><div class="prospect-top"><span>${String(t+1).padStart(2,"0")} · ${e.pos}</span><small>${n.label}</small></div><div class="prospect-person"><div class="prospect-portrait">${_n(e,r)}</div><div><h3>${e.name}</h3><p>${e.age} YEARS · ${e.height}</p><strong>${n.overall}<small>OVR ${n.scouted?"":"EST"}</small></strong></div></div><div class="prospect-attributes"><span>OFF <b>${n.offense??"—"}</b></span><span>DEF <b>${n.defense??"—"}</b></span><span>POT <b>${n.potential??"??"}</b></span></div>${a?os("DRAFT "+e.name.split(" ").at(-1).toUpperCase(),"draft-pick","primary",`data-player="${e.id}"`):n.scouted?'<div class="report-stamp">✓ SCOUTING COMPLETE</div>':os("SCOUT · 1 VISIT","scout-player","secondary",`data-player="${e.id}" ${s.scoutingPoints<1?"disabled":""}`)}</article>`}function Kg({season:i,state:e}){const t=i.offseason;if(!t)return"";Dc(i,e.teamId);const n=we(e.teamId),s=t.order.indexOf(e.teamId)+1;if(t.stage==="review"){const l=t.draftClass.find(h=>h.draftedBy===e.teamId),d=t.draftLog.slice(-8).reverse();return`<div class="page-heading"><div><span class="eyebrow">DRAFT NIGHT · COMPLETE</span><h2>WELCOME TO<br><em>THE FUTURE.</em></h2><p>Your pick is signed. The rest of the league has made its moves.</p></div><div class="record-block"><small>${t.startedYear} DRAFT</small><b>#${l.draftPick}</b><em>${n.short} SELECTION</em></div></div><section class="draft-hero" style="--team:${n.primary};--accent:${n.secondary}"><div class="draft-hero-art">${_n(l,n)}<span>${l.draftPick}</span></div><div><span class="eyebrow">${n.city.toUpperCase()} SELECTS</span><h2>${l.name.toUpperCase()}</h2><p>${l.pos} · ${l.age} YEARS · ${l.height}</p><div class="rookie-ratings"><b>${l.overall}<small>OVERALL</small></b><b>${l.potential}<small>POTENTIAL</small></b><b>3<small>YEAR DEAL</small></b></div><blockquote>“I know what this pick means. I’m ready to earn every minute.”</blockquote>${os("START "+t.startedYear+" SEASON","next-season")}</div></section><section class="draft-recap"><div class="panel-label">LATE SELECTIONS <span>30 PICKS COMPLETE</span></div>${d.map(h=>`<div><span>#${h.pick}</span><b>${h.name}</b><small>${we(h.teamId).short} · ${h.pos} · ${h.overall} OVR</small></div>`).join("")}</section>`}const r=t.draftClass.filter(l=>!l.draftedBy&&(e.draftFilter==="ALL"||l.pos===e.draftFilter)).sort((l,d)=>Js(i,d).overall-Js(i,l).overall||l.id.localeCompare(d.id)),a=Math.max(1,Math.ceil(r.length/12)),o=Math.min(e.draftPage,a-1),c=r.slice(o*12,o*12+12);return`<div class="page-heading"><div><span class="eyebrow">${t.startedYear} DRAFT · ${n.short} PICK #${s}</span><h2>FIND THE<br><em>NEXT LEGEND.</em></h2><p>Regional grades are estimates. Spend a visit to reveal the full report.</p></div><div class="record-block"><small>SCOUTING VISITS</small><b>${t.scoutingPoints}</b><em>${t.scouted.length} FULL REPORTS</em></div></div><section class="draft-desk ${t.stage==="draft"?"is-live":""}"><div><span>${t.stage==="scouting"?"01 · SCOUTING":"02 · ON THE CLOCK"}</span><h3>${t.stage==="scouting"?"BUILD YOUR BOARD.":`${n.city.toUpperCase()}, YOU'RE UP.`}</h3><p>${t.stage==="scouting"?`Eight visits. Sixty prospects. Pick #${s}. Draft order is set by the final standings.`:"Earlier selections are complete. Choose one available prospect; the remaining teams pick immediately after you."}</p></div>${t.stage==="scouting"?os("OPEN THE DRAFT","open-draft"):'<strong class="draft-clock">05:00<small>YOUR SELECTION</small></strong>'}</section><nav class="draft-filters">${["ALL","PG","SG","SF","PF","C"].map(l=>`<button data-action="draft-filter" data-filter="${l}" class="${e.draftFilter===l?"active":""}">${l}</button>`).join("")}<span>${r.length} AVAILABLE</span></nav>${t.stage==="scouting"?`<section class="big-board"><div><span>TOP OF YOUR BOARD</span><small>ESTIMATED OVR · AGE · UPSIDE</small></div>${r.slice(0,5).map((l,d)=>{const h=Js(i,l);return`<article><span>${String(d+1).padStart(2,"0")}</span><b>${l.name}</b><i><em style="width:${h.overall}%"></em></i><strong>${h.overall}</strong><small>${l.age}Y · ${h.potential??"??"} POT</small></article>`}).join("")}</section>`:""}<section class="prospect-grid">${c.map((l,d)=>jg(i,l,o*12+d)).join("")}</section><footer class="draft-pager"><button data-action="draft-page" data-delta="-1" ${o===0?"disabled":""}>← PREVIOUS</button><span>BOARD ${o+1} / ${a}</span><button data-action="draft-page" data-delta="1" ${o>=a-1?"disabled":""}>NEXT →</button></footer>`}function Zg({season:i,state:e}){const t=Dc(i,e.teamId),n=we(e.teamId),s=i.dynasty.history;return`<section class="legacy-hero" style="--team:${n.primary};--accent:${n.secondary}"><div><span class="eyebrow">THE ${n.city.toUpperCase()} LEGACY</span><h2>${t.titles?"BUILT TO<br><em>BE REMEMBERED.</em>":"THE FIRST CHAPTER<br><em>IS JUST INK.</em>"}</h2><p>One GM. Every decision. ${t.seasons||"No"} completed ${t.seasons===1?"season":"seasons"}.</p></div><div class="legacy-numbers"><span><b>${t.titles}</b>TITLES</span><span><b>${t.wins}</b>WINS</span><span><b>${t.seasons}</b>SEASONS</span></div></section><section class="legacy-trend"><div><span>THE WIN TRAJECTORY</span><small>82-GAME SEASONS · ${t.seasons?Math.round(t.wins/t.seasons):0} WIN AVERAGE</small></div><div class="legacy-chart"><i><span>.500</span></i>${s.length?s.map(r=>`<article><b>${r.wins}</b><em style="height:${Math.max(4,r.wins/82*100)}%"></em><small>${r.year}</small></article>`).join(""):"<p>Your first season is unwritten.</p>"}</div><div class="legacy-axis"><span>0 WINS</span><span>41 · PLAYOFF LINE</span><span>82 WINS</span></div></section><div class="history-layout"><section class="season-history"><div class="panel-label">SEASON ARCHIVE <span>${t.wins}–${t.losses} ALL TIME</span></div>${s.length?[...s].reverse().map(r=>`<article><span>${r.year}</span><div><b>${r.wins}–${r.losses}</b><small>${r.userChampion?"LEAGUE CHAMPIONS":`${we(r.championId).city} won the title`}</small></div><strong>${r.userChampion?"★":"—"}</strong><small>${we(r.mvp?r.teamId:r.championId).short} · ${r.mvp||"SEASON ARCHIVED"}</small></article>`).join(""):'<div class="history-empty">Finish a season to write your first chapter.</div>'}</section><aside class="save-vault"><span class="eyebrow">PORTABLE DYNASTY</span><h3>YOUR LEGACY<br>TRAVELS WITH YOU.</h3><p>Saves stay in this browser unless you export them. Download a league file to back up or move your dynasty.</p>${os("EXPORT SAVE FILE","export-save")}<input id="save-import" type="file" accept=".json,application/json" hidden><button class="button secondary" data-action="import-open">IMPORT LEAGUE FILE</button><small>JSON · INCLUDES EVERY SEASON & ROSTER</small></aside></div><section class="banner-case"><div class="panel-label">CHAMPIONSHIP BANNERS <span>${t.championships.length} RAISED</span></div><div>${t.championships.length?t.championships.map(r=>`<article><span>${r}</span><b>${n.short}</b><small>WORLD CHAMPIONS</small></article>`).join(""):"<p>The rafters are waiting.</p>"}</div></section>`}class Jg{constructor(){this.context=null,this.master=null,this.crowd=null;try{this.enabled=localStorage.getItem("bscfd-audio")!=="off"}catch{this.enabled=!0}this.lastScore=0}unlock(){if(this.enabled){if(!this.context){const e=window.AudioContext||window.webkitAudioContext;if(!e)return;this.context=new e,this.master=this.context.createGain(),this.master.gain.value=.32,this.master.connect(this.context.destination),this.makeCrowd()}this.context.state==="suspended"&&this.context.resume().catch(()=>{})}}makeCrowd(){const e=this.context,t=e.sampleRate*3,n=e.createBuffer(2,t,e.sampleRate),s=Ot("BSCFD-CROWD-AUDIO");for(let c=0;c<2;c++){const l=n.getChannelData(c);let d=0;for(let h=0;h<t;h++)d=d*.985+(s()*2-1)*.015,l[h]=d*(.5+.2*Math.sin(h/e.sampleRate*Math.PI*.7))}const r=e.createBufferSource(),a=e.createBiquadFilter(),o=e.createGain();r.buffer=n,r.loop=!0,a.type="bandpass",a.frequency.value=680,a.Q.value=.35,o.gain.value=.12,r.connect(a),a.connect(o),o.connect(this.master),r.start(),this.crowd=o}tone(e,t=.09,n="sine",s=.13,r=0,a=null){if(!this.enabled||(this.unlock(),!this.context))return;const o=this.context,c=o.currentTime+r,l=o.createOscillator(),d=o.createGain();l.type=n,l.frequency.setValueAtTime(e,c),a&&l.frequency.exponentialRampToValueAtTime(a,c+t),d.gain.setValueAtTime(1e-4,c),d.gain.exponentialRampToValueAtTime(s,c+.008),d.gain.exponentialRampToValueAtTime(1e-4,c+t),l.connect(d),d.connect(this.master),l.start(c),l.stop(c+t+.02)}noise(e=.08,t=.08,n=1e3){if(!this.enabled||(this.unlock(),!this.context))return;const s=this.context,r=Math.ceil(s.sampleRate*e),a=s.createBuffer(1,r,s.sampleRate),o=a.getChannelData(0),c=Ot(`sound-${this.lastScore++}`);for(let f=0;f<r;f++)o[f]=c()*2-1;const l=s.createBufferSource(),d=s.createBiquadFilter(),h=s.createGain();l.buffer=a,d.type="bandpass",d.frequency.value=n,h.gain.setValueAtTime(t,s.currentTime),h.gain.exponentialRampToValueAtTime(1e-4,s.currentTime+e),l.connect(d),d.connect(h),h.connect(this.master),l.start()}play(e){this.enabled&&(e==="click"&&this.tone(410,.035,"sine",.035),e==="score"&&(this.tone(660,.09,"triangle",.09),this.tone(880,.13,"triangle",.07,.065)),e==="three"&&(this.tone(660,.08,"triangle",.1),this.tone(990,.1,"triangle",.09,.07),this.tone(1320,.16,"sine",.08,.14)),e==="miss"&&this.noise(.055,.035,1250),e==="timeout"&&(this.tone(920,.15,"square",.05),this.tone(920,.15,"square",.05,.22)),e==="draft"&&[392,523.25,659.25,783.99].forEach((t,n)=>this.tone(t,.3,"triangle",.085,n*.105)),e==="win"&&[261.6,329.6,392,523.25,659.25].forEach((t,n)=>this.tone(t,.42,"triangle",.1,n*.12)),e==="whistle"&&this.tone(1800,.15,"sine",.04,0,2300))}event(e){e&&(e.type==="make"?this.play(e.points===3?"three":"score"):e.type==="miss"?this.play("miss"):e.type==="timeout"||e.type==="period"?this.play("whistle"):e.type==="final"&&this.play("win"))}toggle(){this.enabled=!this.enabled;try{localStorage.setItem("bscfd-audio",this.enabled?"on":"off")}catch{}return this.master&&this.master.gain.setTargetAtTime(this.enabled?.32:0,this.context.currentTime,.04),this.enabled&&this.unlock(),this.enabled}}const nn=new Jg,ii=document.getElementById("app"),Uc="DYNASTY-2027";let At=Qg(),k={screen:"title",tab:"overview",leagueMode:"standings",rosterMode:"rotation",draftFilter:"ALL",draftPage:0,seed:At?.seed||Uc,teamId:At?.teamId||Mt[0].id,playerId:null,stance:At?.stance||"uncommitted",lastResult:At?.lastResult||null},V=At?.season?.schedule?.length===82?At.season:so(k.seed);V.seed||=k.seed;Ft(V);li(V);let Ye=Kt(V,k.teamId),Te=null,hs=1,vn=!1,or=!1,Il=0,za=0;const Dt=(()=>{try{return new hg(document.getElementById("arena"),we(k.teamId))}catch(__noGL){const __s={onStep:null,stats:()=>({}),play(){},seek(){},setGame(){},setOpponent(){},setTeam(){},setWarmup(){}};setInterval(()=>{__s.onStep&&__s.onStep()},50);return __s}})();function Qg(){try{const i=localStorage.getItem(mc);if(!i)return null;const e=JSON.parse(i);return e.version!==gc||!Mt.some(t=>t.id===e.teamId)||typeof e.seed!="string"?null:e}catch{return null}}function xt(){At={version:gc,seed:k.seed,teamId:k.teamId,stance:k.stance,lastResult:k.lastResult,season:V,createdAt:At?.createdAt||Date.now(),updatedAt:Date.now()};try{return localStorage.setItem(mc,JSON.stringify(At)),!0}catch{return gt("Save unavailable in this browser session"),!1}}function tt(i){const e={home:'<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',roster:'<circle cx="9" cy="8" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M17 8h5M19 5v6"/>',league:'<path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0Z"/><path d="M7 6H3v2a4 4 0 0 0 4 4M17 6h4v2a4 4 0 0 1-4 4"/>',arrow:'<path d="m9 18 6-6-6-6"/>',back:'<path d="m15 18-6-6 6-6"/>',spark:'<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8Z"/>',cap:'<circle cx="12" cy="12" r="9"/><path d="M16 8.5A5 5 0 1 0 16 15.5M7 12h7"/>',news:'<path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',check:'<path d="m5 12 4 4L19 6"/>',court:'<rect x="2" y="4" width="20" height="16" rx="1"/><path d="M12 4v16M2 12h4M18 12h4"/><circle cx="12" cy="12" r="3"/>'};return`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e[i]||e.spark}</svg>`}function ro(i=!1){return`<div class="brand ${i?"brand-compact":""}"><span class="brand-ball">B</span><span><b>BSCFD</b><small>LEGENDARY GM</small></span></div>`}function e_(i,e=""){return`${yt(i)}<div class="team-identity-copy"><span>${i.city.toUpperCase()}</span><strong>${i.name.toUpperCase()}</strong>${e?`<small>${e}</small>`:""}</div>`}function Nc(i,e,t="primary",n=""){return`<button class="button ${t}" data-action="${e}" ${n}>${i}${t==="primary"?tt("arrow"):""}</button>`}function t_(){const i=At?we(At.teamId):null;return`<main class="title-screen screen">
    <header class="title-top">${ro()}<span class="season-chip">${V.year} LEAGUE</span></header>
    <section class="hero">
      <div class="eyebrow"><span></span> THE FRONT OFFICE IS YOURS</div>
      <h1>BUILD A<br><em>DYNASTY.</em></h1>
      <p>Every contract has a consequence. Every season writes your legend.</p>
      <div class="hero-actions">
        ${Nc("START NEW DYNASTY","new-game")}
        ${At?`<button class="continue-card" data-action="continue"><span class="continue-logo">${yt(i)}</span><span><small>CONTINUE · SEASON ${V.dynasty.number}</small><b>${i.city} ${i.name}</b><em>82-game campaign</em></span>${tt("arrow")}</button>`:""}
      </div>
      <div class="feature-line"><span>${tt("court")} 3D SIMCAST</span><span>${tt("spark")} LIVING STORIES</span><span>${tt("league")} 30 TEAMS</span></div>
    </section>
    <footer class="title-footer"><span>ORIGINAL FICTIONAL LEAGUE</span><span>SEED-SYNCED SIMULATION</span><span>v1.0</span></footer>
  </main>`}function n_(i){return`<button class="franchise-card ${i.id===k.teamId?"selected":""}" data-action="select-team" data-team="${i.id}" style="--team:${i.primary};--accent:${i.secondary}">
    <span class="power">OVR <b>${Hi(i)}</b></span>${yt(i)}
    <span class="franchise-city">${i.city.toUpperCase()}</span><strong>${i.name.toUpperCase()}</strong>
    <span class="mini-bars"><i style="--v:${i.offense}%"></i><i style="--v:${i.defense}%"></i></span>
    <span class="card-metrics"><small>OFF ${i.offense}</small><small>DEF ${i.defense}</small></span>
  </button>`}function i_(){return we(k.teamId),`<main class="team-screen screen">
    <header class="team-top"><button class="icon-button" data-action="title" aria-label="Back">${tt("back")}</button>${ro(!0)}<span class="step-label">FRANCHISE SELECT <b>01 / 01</b></span></header>
    <section class="select-heading"><div><span class="eyebrow">CHOOSE YOUR LEGACY</span><h2>WHO NEEDS<br>A <em>VISIONARY?</em></h2></div>
      <label class="seed-control"><span>DYNASTY SEED</span><input id="seed-input" value="${k.seed.replace(/["<>]/g,"")}" maxlength="28" spellcheck="false" aria-label="Dynasty seed"><small>Same seed. Same world.</small></label>
    </section>
    <section class="franchise-grid">${Mt.map(n_).join("")}</section>
    <footer class="select-footer"><span><i class="live-dot"></i> 30 FRANCHISES AVAILABLE</span><span>SELECT A TEAM TO REVIEW THE ORGANIZATION</span></footer>
    <div id="team-sheet-host"></div>
  </main>`}function s_(i){k.teamId=i;const e=we(i);Dt.setTeam(e),Ye=dr(e,k.seed);const t=112-Ye.reduce((s,r)=>s+r.salary,0);document.querySelectorAll(".franchise-card").forEach(s=>s.classList.toggle("selected",s.dataset.team===i));const n=document.getElementById("team-sheet-host");n.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"></div><aside class="team-sheet" style="--team:${e.primary};--accent:${e.secondary}">
    <button class="icon-button sheet-close" data-action="close-sheet" aria-label="Close">${tt("close")}</button>
    <div class="sheet-team">${e_(e,"EST. 1987 · SEASON 40")}</div>
    <div class="owner-quote"><span>OWNER'S BRIEF</span><p>“We don't need a caretaker. We need someone who can turn this city into a basketball capital.”</p></div>
    <div class="ratings-row"><div><span>OFFENSE</span><b>${e.offense}</b><i><em style="width:${e.offense}%"></em></i></div><div><span>DEFENSE</span><b>${e.defense}</b><i><em style="width:${e.defense}%"></em></i></div><div><span>MARKET</span><b>${e.market}</b><i><em style="width:${e.market}%"></em></i></div></div>
    <div class="sheet-info"><span><small>CAP FLEXIBILITY</small><b>${Pt(t)}</b></span><span><small>EXPECTATION</small><b>${Hi(e)>84?"TITLE OR BUST":Hi(e)>79?"PLAYOFF PUSH":"BUILD THE CORE"}</b></span></div>
    ${Nc(`TAKE OVER ${e.name.toUpperCase()}`,"confirm-team")}
  </aside>`}function Ci(i,e,t){return`<button class="nav-item ${k.tab===i?"active":""}" data-action="tab" data-tab="${i}">${tt(t)}<span>${e}</span></button>`}function r_(i){const e=we(k.teamId),t=[...Ye].sort((r,a)=>a.overall-r.overall)[0],n=V.records[k.teamId],s=V.phase==="regular"?`GAME ${Math.min(82,V.round+1)} OF 82`:V.phase==="complete"?`${we(V.playoffs.championId).city.toUpperCase()} CHAMPIONS`:V.phase==="offseason"?`${V.year+1} DRAFT · THE FUTURE IS YOURS`:mr(V.playoffs.round);return`<main class="hub-screen screen" style="--team:${e.primary};--accent:${e.secondary}">
    <header class="hub-top">${ro(!0)}<button class="current-team" data-action="title" title="Return to title">${yt(e)}<span><b>${e.city.toUpperCase()}</b><strong>${e.name.toUpperCase()}</strong></span></button><div class="top-meta"><span>SEASON <b>${String(V.dynasty.number).padStart(2,"0")}</b></span><span>YEAR <b>${V.year}</b></span><button class="audio-toggle" data-action="audio-toggle" aria-label="${nn.enabled?"Mute":"Enable"} generated arena audio" aria-pressed="${nn.enabled}" title="Arena audio (M)">${nn.enabled?"♪":"×"}</button><button class="avatar" data-action="owner" aria-label="GM profile">GM</button></div></header>
    <nav class="side-nav">${Ci("overview","Overview","home")}${Ci("roster","Roster","roster")}${Ci("league","League","league")}<div class="nav-spacer"></div><span class="seed-badge">SEED<br><b>${k.seed}</b></span></nav>
    <section class="hub-content">${i}</section>
    <div class="broadcast-ticker"><span class="ticker-brand">BSCFD <b>LIVE</b></span><span class="ticker-lead">${s}</span><span class="ticker-copy">${t.name} · ${n.wins}–${n.losses} · ${Object.keys(V.injuries).length} league injuries</span><span class="ticker-desk">LEAGUE DESK&nbsp;&nbsp; • &nbsp;&nbsp;30 TEAMS&nbsp;&nbsp; • &nbsp;&nbsp;ONE CHAMPION</span></div>
    <nav class="bottom-nav">${Ci("overview","Overview","home")}${Ci("roster","Roster","roster")}${Ci("league","League","league")}</nav>
    <div id="modal-host"></div><div id="toast-host"></div>
  </main>`}function a_(){const i=we(k.teamId),e=hr(V,k.teamId),t=V.records[k.teamId],n=Ye.reduce((g,_)=>g+_.salary,0),s=112-n,r=[...Ye].sort((g,_)=>_.overall-g.overall).slice(0,3),a=e?.homeId===k.teamId,o=e?we(a?e.awayId:e.homeId):null,c=V.phase==="regular"?V.round===0?"OPENING NIGHT":`GAME ${V.round+1} OF 82`:V.phase==="playoffs"?mr(V.playoffs.round):"SEASON COMPLETE",l=e?.series,d=l?`${l.homeWins} — ${l.awayWins}`:"",h=e?`<section class="panel next-game"><div class="panel-label">NEXT GAME <span>${c}</span></div><div class="matchup"><div>${yt(i)}<b>${i.short}</b><small>${a?"HOME":"AWAY"}</small></div><span><small>${Tc(e.date)} · 7:30 PM</small><b>${l?d:"VS"}</b><em>${l?"SERIES SCORE":we(e.homeId).city.toUpperCase()}</em></span><div>${yt(o)}<b>${o.short}</b><small>${a?"AWAY":"HOME"}</small></div></div><div class="game-actions"><button class="game-strip" data-action="start-sim"><span>WATCH 3D SIMCAST ${tt("arrow")}</span><b>${c}</b></button><button class="game-strip quick" data-action="quick-sim"><span>QUICK SIM ${tt("arrow")}</span></button></div>${V.phase==="regular"?`<button class="season-sim" data-action="sim-season">SIM TO PLAYOFFS · ${82-V.round} GAMES REMAIN</button>`:""}</section>`:`<section class="panel next-game champion-panel"><div class="panel-label">THE FINALS <span>COMPLETE</span></div><div class="matchup"><div>${yt(we(V.playoffs.championId))}<b>${we(V.playoffs.championId).short}</b><small>WORLD CHAMPIONS</small></div><span><small>${V.year} SEASON</small><b>4 WINS</b><em>LEGACY SECURED</em></span><div>${yt(i)}<b>${i.short}</b><small>${V.playoffs.championId===k.teamId?"YOUR DYNASTY":"NEXT SEASON"}</small></div></div><button class="game-strip" data-action="begin-offseason"><span>BEGIN ${V.year+1} OFFSEASON ${tt("arrow")}</span></button></section>`,f=V.injuryLog[0],p=V.awards?.mvp;return`<div class="page-heading"><div><span class="eyebrow">GENERAL MANAGER HQ</span><h2>${V.phase==="complete"?"THE SEASON <em>IS HISTORY.</em>":"THE VISION <em>STARTS HERE.</em>"}</h2></div><div class="record-block"><small>REGULAR SEASON</small><b>${t.wins} <span>—</span> ${t.losses}</b><em>${V.phase==="regular"?`${82-V.round} GAMES REMAIN`:c}</em></div></div>
    <div class="dashboard-grid">${h}
      <section class="panel directive"><div class="panel-label">OWNER DIRECTIVE <span>${t.wins>=41?"ON TRACK":"NEW"}</span></div><div class="directive-icon">${tt("spark")}</div><h3>MAKE THE CITY<br>BELIEVE AGAIN.</h3><p>Build a top-ten offense while keeping the payroll below $112.0M.</p><div class="goal-progress"><span><b>OFFENSE #${Math.max(1,31-Math.round(i.offense/3))}</b><small>CURRENT</small></span><i><em style="width:${i.offense}%"></em></i></div><button class="text-button" data-action="owner">REVIEW BRIEF ${tt("arrow")}</button></section>
      <section class="panel finance"><div class="panel-label">FINANCIAL OUTLOOK</div><div class="cap-number"><small>PROJECTED CAP ROOM</small><b>${Pt(s)}</b><span>+ ${Pt(i.market/10)} <small>local revenue</small></span></div><div class="cap-track"><i style="width:${Math.min(100,n/112*100)}%"></i><span></span></div><div class="cap-legend"><span>PAYROLL <b>${Pt(n)}</b></span><span>CAP <b>$112.0M</b></span></div><div class="finance-foot"><span>${tt("cap")} FLEXIBILITY GRADE</span><b>${s>20?"A":s>8?"B+":"C"}</b></div></section>
      <section class="panel core-panel"><div class="panel-label">THE CORE <button class="text-button" data-action="tab" data-tab="roster">FULL ROSTER ${tt("arrow")}</button></div><div class="core-list">${r.map((g,_)=>{const m=V.playerStats[g.id],u=m?(m.points/m.gp).toFixed(1):"—";return`<button class="core-player" data-action="player" data-player="${g.id}"><span class="rank">0${_+1}</span><span class="core-portrait">${_n(g,i)}</span><span><b>${g.name}</b><small>${g.pos} · ${u} PPG · ${Pt(g.salary)}</small></span><strong>${g.overall}<small>OVR</small></strong>${tt("arrow")}</button>`}).join("")}</div><div class="analytics-strip">${[["STAR POWER",r[0].overall],["SHOOTING",Ye.reduce((g,_)=>g+_.offense,0)/Ye.length],["DEFENSE",Ye.reduce((g,_)=>g+_.defense,0)/Ye.length],["YOUTH",Math.max(35,112-Ye.reduce((g,_)=>g+_.age,0)/Ye.length*2)],["DEPTH",Ye.slice(5).reduce((g,_)=>g+_.overall,0)/7]].map(([g,_])=>`<div class="analytics-factor"><span>${g}</span><b>${Math.round(_)}</b><i><em style="width:${Math.min(100,_)}%"></em></i></div>`).join("")}</div></section>
      <section class="panel league-pulse"><div class="panel-label">AROUND THE LEAGUE <span>LIVE</span></div><div class="lead-story"><div class="story-portrait">${_n(r[0],i)}</div><span>${p?"KIA MVP":"SEASON PREVIEW"}</span><h3>${p?p.name.toUpperCase():"THIRTY TEAMS.<br>ONE <em>IMMORTAL.</em>"}</h3><p>${p?`${p.points} PTS · ${p.reb} REB · ${p.ast} AST per game.`:`${r[0].name} and ${i.city} enter the league's widest-open title race in years.`}</p></div>${f?`<div class="news-item">${tt("news")}<span><b>${f.name} sidelined ${f.games} games.</b><small>INJURY DESK · ${we(f.teamId).short}</small></span></div>`:'<div class="news-item">'+tt("news")+"<span><b>Scouts project a historically deep 2028 draft.</b><small>LEAGUE DESK · 12 MIN AGO</small></span></div>"}<div class="news-item">${tt("spark")}<span><b>${Object.keys(V.results).length} games logged · replay ${pr(V)}</b><small>DETERMINISTIC LEAGUE FEED</small></span></div></section>
    </div>`}function Pl(i,e,t,n=null){const s=n?i.overall-n.overall:0;return`<div class="trade-person"><span>${t}</span><div class="trade-portrait">${_n(i,e)}</div><b>${i.name}</b><small>${e.short} · ${i.pos} · ${i.age} YEARS</small><strong>${i.overall}<small>OVR</small></strong><em>${Pt(i.salary)} · ${i.years}Y</em>${n?`<div class="trade-comparison"><span>OVERALL <b class="${s>=0?"positive":"negative"}">${s>=0?"+":""}${s}</b></span><span>OFFENSE <b>${i.offense}</b></span><span>DEFENSE <b>${i.defense}</b></span></div>`:""}</div>`}function o_(){const i=we(k.teamId),e=Ft(V),t=e.rotations[k.teamId],n=Ye.filter(o=>V.injuries[o.id]).length,s=Sc(V,k.teamId),r=[...Ye].sort((o,c)=>o.morale-c.morale)[0],a=(o,c)=>{const l=V.injuries[o.id],d=V.playerStats[o.id],h=d?(d.points/d.gp).toFixed(1):"—",f=d?Math.round(d.seconds/d.gp/60):0;return`<div class="roster-row ${o.starter?"is-starter":""} ${l?"is-injured":""}"><button class="roster-name roster-open" data-action="player" data-player="${o.id}"><i>${o.number}</i><span><b>${o.name}</b><small>${l?`OUT ${l} G · DAY TO DAY`:`${o.age} YRS · ${h} PPG · ${f} MPG · ${o.starter?"STARTER":"BENCH"}`}</small></span></button><span data-label="POS">${o.pos}</span><span data-label="MIN" class="minute-control"><button data-action="minutes" data-player="${o.id}" data-delta="-2" aria-label="Reduce ${o.name} minutes">−</button><b>${t[c]}</b><button data-action="minutes" data-player="${o.id}" data-delta="2" aria-label="Increase ${o.name} minutes">+</button></span><span data-label="OFF">${o.offense}</span><span data-label="DEF">${o.defense}</span><span data-label="MORALE"><i class="morale"><em style="width:${o.morale}%"></em></i>${Math.round(o.morale)}</span><span data-label="CONTRACT">${Pt(o.salary)} <small>/ ${o.years}Y</small></span><strong class="ovr">${o.overall}</strong></div>`};return`<section class="panel roster-panel"><div class="roster-toolbar"><div class="legend"><span><i class="starter-dot"></i> STARTER</span><span><i></i> ROTATION</span></div><span>${n} INJURED · ${t.reduce((o,c)=>o+c,0)} MIN ASSIGNED · CHEMISTRY ${s}</span></div><div class="rotation-tip">SET THE PLAN <span>Minutes rebalance automatically across the other eleven players. Roles and results affect morale.</span></div><div class="rotation-insights"><article class="minutes-insight"><div><span>ROTATION LOAD</span><b>${t.slice(0,5).reduce((o,c)=>o+c,0)} <small>STARTER MIN</small></b></div><div class="minutes-map">${Ye.map((o,c)=>`<i class="${c<5?"starting":""}" style="width:${t[c]/240*100}%" title="${o.name}: ${t[c]} minutes"></i>`).join("")}</div><div class="minutes-axis"><span>STARTING FIVE</span><span>BENCH ${t.slice(5).reduce((o,c)=>o+c,0)} MIN</span></div></article><article class="chemistry-insight"><svg viewBox="0 0 42 42"><circle cx="21" cy="21" r="16" pathLength="100"/><circle cx="21" cy="21" r="16" pathLength="100" style="stroke-dasharray:${s} 100"/></svg><div><span>CHEMISTRY INDEX</span><b>${s}</b><small>${Ye.filter(o=>o.morale>=75).length} PLAYERS BUYING IN</small></div></article><button class="role-insight" data-action="player" data-player="${r.id}"><div>${_n(r,i)}</div><span><small>ROLE WATCH</small><b>${r.name}</b><em>${Math.round(r.morale)} MORALE · ${t[Ye.indexOf(r)]} MIN</em></span>${tt("arrow")}</button></div>
    <div class="roster-table"><div class="roster-row roster-head"><span>PLAYER</span><span>POS</span><span>MIN</span><span>OFF</span><span>DEF</span><span>MORALE</span><span>CONTRACT</span><span>OVR</span></div>${Ye.slice(0,5).map((o,c)=>a(o,c)).join("")}<details class="bench-group" ${innerWidth>700?"open":""}><summary><span>BENCH UNIT</span><b>${Ye.length-5} PLAYERS · ${t.slice(5).reduce((o,c)=>o+c,0)} MIN</b></summary><div class="bench-rows">${Ye.slice(5).map((o,c)=>a(o,c+5)).join("")}</div></details>
    </div></section>`}function l_(){const i=Ec(V,k.teamId),e=we(k.teamId),t=di-hi(Ye);return`<section class="front-office-intro"><div><span class="eyebrow">THE TRADE DESK</span><h3>VALUE IS A<br><em>PERSPECTIVE.</em></h3></div><p>Offers refresh every six games. Every proposal explains the other GM's logic and its cap impact.<br>Current flexibility: <b>${Pt(t)}</b></p></section><div class="trade-grid">${i.length?i.map(n=>{const s=we(n.partnerId),r=Ye.find(o=>o.id===n.giveId),a=Kt(V,s.id).find(o=>o.id===n.receiveId);return`<article class="trade-card"><div class="trade-partner">${yt(s)}<span><small>TRADE PROPOSAL</small><b>${s.city.toUpperCase()} ${s.name.toUpperCase()}</b></span><strong>${n.fit} FIT</strong></div><div class="trade-people">${Pl(r,e,"YOU SEND")}<span class="trade-arrow">⇄</span>${Pl(a,s,"YOU RECEIVE",r)}</div><p class="trade-reason">${n.reason}</p><div class="trade-bottom"><span>CAP CHANGE <b class="${n.salaryDelta>0?"negative":"positive"}">${n.salaryDelta>=0?"+":""}${Pt(n.salaryDelta).replace("−","−")}</b></span><button class="button primary" data-action="accept-trade" data-offer="${n.id}">ACCEPT TRADE ${tt("arrow")}</button></div></article>`}).join(""):'<section class="panel empty-playoffs"><h3>NO CAP-LEGAL OFFERS.</h3><p>Create flexibility through free agency or a contract decision. The desk refreshes after the next round.</p></section>'}</div>${V.league.tradeLog.length?`<div class="transaction-log"><span>RECENT TRANSACTIONS</span>${V.league.tradeLog.slice(0,3).map(n=>`<p><b>${we(n.partnerId).short}</b> · ${n.reason}</p>`).join("")}</div>`:""}`}function c_(){const i=Ft(V).freeAgents,e=we(k.teamId);return`<section class="front-office-intro"><div><span class="eyebrow">OPEN MARKET · ${i.length} AVAILABLE</span><h3>FIND THE<br><em>MISSING PIECE.</em></h3></div><p>Signing requires a corresponding release. Two-year offers use the listed asking salary; cap legality is checked before completion.</p></section><section class="free-agent-grid">${i.map(t=>`<article class="free-agent-card"><div class="fa-portrait">${_n(t,e)}</div><div class="fa-copy"><span>${t.pos} · ${t.age} YEARS · ${t.height}</span><b>${t.name}</b><small>OFF ${t.offense} · DEF ${t.defense} · POT ${t.potential}</small><div><strong>${t.overall}<small>OVR</small></strong><b>${Pt(t.ask)}<small>ASK / 2Y</small></b></div></div><button class="button secondary" data-action="sign-open" data-player="${t.id}">SIGN & RELEASE</button></article>`).join("")}</section>`}function d_(){we(k.teamId);const i=di-hi(Ye);return`<div class="page-heading"><div><span class="eyebrow">PERSONNEL</span><h2>YOUR <em>ROSTER.</em></h2><p>Twelve players. Five spots. Every minute matters.</p></div><div class="roster-summary"><span><small>CHEMISTRY</small><b>${Sc(V,k.teamId)}</b></span><span><small>CAP ROOM</small><b>${Pt(i)}</b></span></div></div><nav class="personnel-tabs">${[["rotation","ROTATION"],["trades","TRADE CENTER"],["free-agency","FREE AGENCY"]].map(([e,t])=>`<button data-action="roster-mode" data-mode="${e}" class="${k.rosterMode===e?"active":""}">${t}</button>`).join("")}</nav>${k.rosterMode==="trades"?l_():k.rosterMode==="free-agency"?c_():o_()}`}function Oc(i,e=null){const t=Ft(V).freeAgents.find(r=>r.id===i);if(!t)return"";const n=Ye.find(r=>r.id===e)||[...Ye].sort((r,a)=>a.salary-r.salary)[0],s=di-hi(Ye)+n.salary-t.ask;return`<div class="modal-backdrop" data-action="close-modal"></div><section class="signing-modal"><button class="icon-button modal-close" data-action="close-modal">${tt("close")}</button><span class="eyebrow">CONTRACT DESK</span><h2>MAKE ROOM<br>FOR <em>${t.name.toUpperCase()}.</em></h2><div class="signing-summary"><b>${t.pos} · ${t.overall} OVR</b><span>${Pt(t.ask)} · 2 YEARS</span></div><label for="release-select">PLAYER TO RELEASE</label><select id="release-select">${Ye.map(r=>`<option value="${r.id}" ${r.id===n.id?"selected":""}>${r.name} · ${r.pos} · ${Pt(r.salary)}</option>`).join("")}</select><input type="hidden" id="sign-player" value="${t.id}"><div class="cap-projection"><span>PROJECTED CAP ROOM</span><b id="sign-cap" class="${s<0?"negative":"positive"}">${Pt(s)}</b><small id="sign-warning">${s<0?"Over the cap. Choose a higher-salary release.":"Cap legal. The released player enters free agency."}</small></div><button class="button primary" data-action="sign-confirm" ${s<0?"disabled":""}>SIGN CONTRACT ${tt("arrow")}</button></section>`}function h_(){return`<section class="panel standings-panel"><div class="standings-head"><span>RK</span><span>FRANCHISE</span><span>RECORD</span><span>OFF</span><span>DEF</span><span>OVR</span></div>${fr(V).map((e,t)=>`<div class="standing-row ${e.id===k.teamId?"user-team":""}" style="--row-team:${e.primary}"><span class="standing-rank">${String(t+1).padStart(2,"0")}</span><span class="standing-team">${yt(e)}<span><b>${e.city} ${e.name}</b><small>${e.short} · ${e.streak>0?`WON ${e.streak}`:e.streak<0?`LOST ${Math.abs(e.streak)}`:"SEASON PREVIEW"}</small></span></span><span class="standing-record">${e.wins}–${e.losses}</span><span>${e.offense}</span><span>${e.defense}</span><strong>${Hi(e)}</strong></div>`).join("")}</section>`}function u_(){const i=Math.max(0,Math.min(74,V.round-2));return`<section class="schedule-list">${V.schedule.slice(i,i+8).map(t=>{const n=t.games.find(o=>o.homeId===k.teamId||o.awayId===k.teamId),s=V.results[n.id],r=we(n.homeId),a=we(n.awayId);return`<article class="schedule-round ${s?"played":""}"><div class="schedule-date"><small>ROUND ${t.round+1}</small><b>${Tc(t.date)}</b><span>${s?"FINAL":"15 GAMES"}</span></div><div class="schedule-match">${yt(a)}<span><small>${a.city}</small><b>${a.short}</b></span><strong>${s?`${s.awayScore} — ${s.homeScore}`:"AT"}</strong><span><small>${r.city}</small><b>${r.short}</b></span>${yt(r)}</div><div class="schedule-context"><span>${s?`${s.winnerId===k.teamId?"WIN":"LOSS"} · ${s.checksum}`:n.homeId===k.teamId?"HOME · LEGENDARY ARENA":`AWAY · ${r.city.toUpperCase()}`}</span>${!s&&t.round===V.round?'<button class="text-button" data-action="quick-sim">QUICK SIM →</button>':""}</div></article>`}).join("")}</section>`}function f_(i){return`<svg class="championship-trophy" viewBox="0 0 240 220" role="img" aria-label="${V.year} championship trophy"><defs><linearGradient id="trophy-gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0a6"/><stop offset=".35" stop-color="${i.secondary}"/><stop offset=".7" stop-color="#9b5b11"/><stop offset="1" stop-color="#ffe28a"/></linearGradient><radialGradient id="trophy-glow"><stop stop-color="${i.secondary}" stop-opacity=".38"/><stop offset="1" stop-color="${i.secondary}" stop-opacity="0"/></radialGradient></defs><circle cx="120" cy="104" r="105" fill="url(#trophy-glow)"/><g fill="none" stroke="${i.secondary}" stroke-opacity=".32"><path d="M25 50 48 64M196 44l-23 22M18 116h35M186 116h37M56 20l17 29M172 16l-14 31"/></g><path d="M77 43h86v43c0 37-17 62-43 62S77 123 77 86Z" fill="url(#trophy-gold)" stroke="#ffe9a0" stroke-width="2"/><path d="M78 58H49v20c0 26 17 39 39 39M162 58h29v20c0 26-17 39-39 39" fill="none" stroke="url(#trophy-gold)" stroke-width="9"/><path d="M105 146h30v24h27v17H78v-17h27Z" fill="url(#trophy-gold)"/><path d="M65 187h110l13 19H52Z" fill="#172232" stroke="${i.secondary}"/><circle cx="120" cy="86" r="25" fill="#101c29" stroke="#fff0b0" stroke-width="2"/><path d="M95 86h50M120 61c-10 12-10 38 0 50M120 61c10 12 10 38 0 50" fill="none" stroke="${i.secondary}" stroke-width="2"/><path d="m91 48 9 73" stroke="#fff" stroke-opacity=".5" stroke-width="4"/></svg>`}function p_(){if(!V.playoffs?.round)return"";const i={};for(const t of Object.values(V.results)){if(!t.seriesId)continue;const n=Number(t.seriesId.match(/^P(\d+)/)?.[1]);if(n>=V.playoffs.round)continue;(i[t.seriesId]||={round:n,id:t.seriesId,games:[]}).games.push(t)}const e=Object.values(i).sort((t,n)=>t.round-n.round||t.id.localeCompare(n.id));return e.length?`<details class="bracket-history"><summary>THE ROAD HERE <span>${new Set(e.map(t=>t.round)).size} ROUNDS COMPLETE</span></summary><div>${e.map(t=>{const n=t.games.sort((o,c)=>o.id.localeCompare(c.id))[0],s=we(n.homeId),r=we(n.awayId),a=t.games.filter(o=>o.winnerId===s.id).length;return`<span><b>${mr(t.round)}</b>${s.short} ${a} — ${t.games.length-a} ${r.short}</span>`}).join("")}</div></details>`:""}function m_(){const i=V.playoffs;if(!i)return'<section class="panel empty-playoffs"><span class="eyebrow">THE ROAD TO SIXTEEN</span><h3>82 GAMES.<br>ONE BRACKET.</h3><p>The top eight teams in each conference advance. Every series is first to four.</p><button class="button primary" data-action="sim-season">SIM TO PLAYOFFS</button></section>';const e=i.championId?we(i.championId):null;return`${e?`<section class="championship-banner" style="--champion:${e.primary};--champion-accent:${e.secondary}"><div class="championship-art">${f_(e)}${yt(e)}</div><div class="championship-copy"><span>${V.year} BSCFD CHAMPIONS</span><h2>${e.city.toUpperCase()}<br>${e.name.toUpperCase()}</h2><p>Sixteen wins. One immortal season.<br>The ${e.name} stand alone.</p></div><div class="championship-legacy"><small>FRANCHISE TITLES</small><b>01</b><span>LEGACY SECURED</span></div></section>`:""}${V.awards?`<section class="awards-grid">${[["MVP",V.awards.mvp],["DEFENSIVE PLAYER",V.awards.defensive],["ROOKIE OF THE YEAR",V.awards.rookie]].map(([t,n])=>{const s=we(n.teamId),r=Kt(V,n.teamId).find(a=>a.id===n.playerId);return`<article class="award-card" style="--winner:${s.primary};--winner-accent:${s.secondary}"><div class="award-portrait">${_n(r,s)}</div><div class="award-copy"><span>${t}</span><b>${n.name}</b><small>${s.city} · ${r.pos} · #${r.number}</small><div class="award-stats"><strong>${n.points}<small>PPG</small></strong><strong>${n.reb}<small>RPG</small></strong><strong>${n.ast}<small>APG</small></strong></div><i><em style="width:${Math.min(100,n.points/35*100)}%"></em></i></div></article>`}).join("")}</section>`:""}<div class="playoff-heading"><span>${mr(i.round)}</span><small>FIRST TO FOUR · ${i.series.filter(t=>!t.winnerId).length} ACTIVE SERIES</small>${V.phase==="playoffs"?'<button class="text-button" data-action="sim-playoffs">SIM TO CHAMPION →</button>':""}</div><section class="series-grid">${i.series.map(t=>{const n=we(t.homeId),s=we(t.awayId),r=V.results[t.games.at(-1)];return`<article class="series-card ${t.homeId===k.teamId||t.awayId===k.teamId?"user-series":""}"><div class="series-meta"><span>${t.conference}</span><b>${t.winnerId?"SERIES FINAL":`GAME ${t.gameNo+1}`}</b></div><div class="series-team">${yt(n)}<span><b>${n.city} ${n.name}</b><small>${V.records[n.id].wins}–${V.records[n.id].losses} · HOME COURT</small></span><strong>${t.homeWins}</strong></div><div class="series-team">${yt(s)}<span><b>${s.city} ${s.name}</b><small>${r?`LAST · ${r.awayScore}—${r.homeScore}`:`${V.records[s.id].wins}–${V.records[s.id].losses} · SERIES TIED`}</small></span><strong>${t.awayWins}</strong></div>${t.winnerId?`<div class="series-winner">${we(t.winnerId).city.toUpperCase()} ADVANCES</div>`:""}</article>`}).join("")}</section>${p_()}`}function g_(){const i=Fg(V);return`<div class="page-heading"><div><span class="eyebrow">LEAGUE CENTRAL</span><h2>${k.leagueMode==="history"?"YOUR <em>LEGACY.</em>":"THE <em>COMPETITION.</em>"}</h2><p>${k.leagueMode==="history"?"The record of every choice you made.":`${i.games} games logged across the BSCFD.`}</p></div><div class="record-block"><small>LEAGUE FILE · SEED SYNCED</small><b class="checksum">${pr(V)}</b><em>30 TEAMS · SEASON ${V.dynasty.number}</em></div></div><nav class="league-tabs">${[["standings","STANDINGS"],["schedule","CALENDAR"],["playoffs","PLAYOFFS"],["history","LEGACY"]].map(([e,t])=>`<button data-action="league-mode" data-mode="${e}" class="${k.leagueMode===e?"active":""}">${t}</button>`).join("")}</nav>${k.leagueMode==="history"?Zg({season:V,state:k}):k.leagueMode==="schedule"?u_():k.leagueMode==="playoffs"?m_():h_()}`}function __(i){const e=Ye.find(a=>a.id===i);if(!e)return"";const t=we(k.teamId),n=bc(e),s=V.playerStats[e.id],r=s?Math.round(s.seconds/s.gp/60):0;return`<div class="modal-backdrop" data-action="close-modal"></div><section class="player-modal" style="--team:${t.primary};--accent:${t.secondary}"><button class="icon-button modal-close" data-action="close-modal">${tt("close")}</button><div class="portrait-wrap">${_n(e,t)}<span class="portrait-pos">${e.pos}</span></div><div class="player-details"><span class="eyebrow">${e.starter?"STARTING FIVE":"ROTATION PLAYER"}</span><h2>${e.name}</h2><div class="player-meta">#${e.number} · ${e.height} · ${e.age} YEARS OLD · ${r} MPG</div><div class="big-rating"><b>${e.overall}</b><span>OVERALL<small>POTENTIAL ${e.potential}</small></span></div><div class="attribute-grid"><span>OFFENSE <b>${e.offense}</b></span><span>DEFENSE <b>${e.defense}</b></span><span>MORALE <b>${Math.round(e.morale)}</b></span><span>CONTRACT <b>${Pt(e.salary)} · ${e.years}Y</b></span></div><blockquote>“${e.morale>85?"I love the direction here. Let’s make some noise.":e.morale>72?"I’m ready for whatever the team needs.":"I want a bigger role. I know I can contribute."}”</blockquote><div class="player-actions">${e.starter?"":`<button class="button secondary" data-action="make-starter" data-player="${e.id}">MOVE TO STARTING FIVE</button>`}${e.years<=2?`<button class="button secondary" data-action="extend-contract" data-player="${e.id}">EXTEND · ${Pt(n.salary)} / 3Y</button>`:""}</div><button class="button primary" data-action="close-modal">BACK TO ROSTER</button></div></section>`}function v_(){const i=we(k.teamId),e=k.stance==="contender"?78:k.stance==="rebuild"?75:72;return`<div class="modal-backdrop" data-action="close-modal"></div><section class="owner-modal owner-scene" style="--team:${i.primary};--accent:${i.secondary}"><button class="icon-button modal-close" data-action="close-modal">${tt("close")}</button><div class="owner-visual">${og(i)}<div class="owner-nameplate"><small>MAJORITY OWNER</small><b>MORGAN STERLING</b><span>TRUST <strong>${e}</strong></span></div></div><div class="owner-dialogue"><span class="eyebrow">OWNER DIRECTIVE · SEASON 1</span><h2>MAKE ${i.city.toUpperCase()} <em>BELIEVE.</em></h2><p>“I’m giving you the keys because safe decisions haven’t made us special. What kind of team are we building, GM?”</p><div class="objective-list"><span>${tt("check")} Finish with a top-ten offensive rating</span><span>${tt("check")} Keep payroll below $112.0M</span></div><div class="dialogue-choices"><button data-action="owner-stance" data-stance="contender" class="choice-button ${k.stance==="contender"?"chosen":""}"><small>WIN THE ROOM</small><b>“A contender. Right now.”</b><span>Owner trust +6</span></button><button data-action="owner-stance" data-stance="rebuild" class="choice-button ${k.stance==="rebuild"?"chosen":""}"><small>BACK YOUR VISION</small><b>“A dynasty. Built to last.”</b><span>Owner trust +3</span></button></div></div></section>`}function x_(){const i=hr(V,k.teamId);if(!i){ur(V,k.teamId),xt(),$e();return}const e=we(i.homeId),t=we(i.awayId),n=s=>yc(V,s);Te=new _c({seed:`${k.seed}|${V.year}|${i.id}`,homeTeam:e,awayTeam:t,homeRoster:n(e.id),awayRoster:n(t.id)}),Te.userSide=i.homeId===k.teamId?"home":"away",Te.fixtureId=i.id,hs=1,vn=!1,or=!1,za=0,k.screen="simcast",Dt.setTeam(e),Dt.setOpponent(t),Dt.setGame(Te),$e()}function Ll(i=!1){i&&Te?.result&&(k.lastResult=Te.result,xt()),Te=null,vn=!1,k.screen="hub",k.tab="overview",Dt.setTeam(we(k.teamId)),Dt.setWarmup(),$e()}function ao(){if(!Te?.result)return;vn=!0,k.lastResult=Te.result,Te.seasonCommitted||(Ug(V,k.teamId,Te),Te.seasonCommitted=!0),xt();const i=document.getElementById("result-host");i&&!i.hasChildNodes()&&(i.innerHTML=xc(Te))}function M_(i){if(!i||V.phase!=="regular"||V.round===0||V.round%6!==0)return null;const e=Ot(`${k.seed}|${V.year}|story|${V.round}`),t=[...Ye].sort((r,a)=>a.overall-r.overall)[0],n=V.records[k.teamId],s=[`${t.name} has become the heartbeat of ${we(k.teamId).city}. The city is starting to believe.`,`Morgan Sterling: “${n.wins>=n.losses?"Keep pushing. This league is noticing us.":"I still back the vision. Now show me the response."}”`,`The locker room votes ${t.name} its player of the month. A moment worth celebrating.`,`National broadcast alert: ${we(k.teamId).city} is the league's must-watch story after ${V.round} games.`];return s[Math.floor(e()*s.length)]}function y_(){const i=ur(V,k.teamId),e=M_(i);xt(),$e(),gt(e||(i?`Final · ${we(i.awayId).short} ${i.awayScore}, ${we(i.homeId).short} ${i.homeScore}`:"The playoff round is complete."))}function Dl(i){const e=document.getElementById("sim-toast");e&&(e.innerHTML=`<div class="sim-toast" role="status" aria-live="polite">${i}</div>`,setTimeout(()=>{e&&(e.innerHTML="")},1800))}Dt.onStep=()=>{if(k.screen!=="simcast"||!Te||vn||Te.state.finished)return;for(let e=0;e<hs&&!Te.state.finished;e++)Te.step();const i=performance.now();i-Il>100&&(rr(Te),Te.state.eventSeq>za&&(za=Te.state.eventSeq,nn.event(Te.lastEvent)),Il=i),Te.state.finished&&ao()};function $e(i=!1){const e=i&&document.querySelector(".hub-content")?.scrollTop||0;Ye=Kt(V,k.teamId),k.screen==="title"?ii.innerHTML=t_():k.screen==="team"?ii.innerHTML=i_():k.screen==="simcast"&&Te?(ii.innerHTML=mg(Te,hs,vn,or),rr(Te),Te.state.finished&&ao()):ii.innerHTML=r_(k.tab==="roster"?d_():k.tab==="league"?g_():V.phase==="offseason"?Kg({season:V,state:k}):a_()),document.body.dataset.screen=k.screen,i&&document.querySelector(".hub-content")?.scrollTo(0,e)}function gt(i){requestAnimationFrame(()=>{const e=document.getElementById("toast-host");e&&(e.innerHTML=`<div class="toast" role="status" aria-live="polite">${tt("spark")}<span>${i}</span></div>`,setTimeout(()=>{e&&(e.innerHTML="")},3600))})}function $s(){const i=Ot(`${k.seed}|welcome|${k.teamId}`),e=document.getElementById("toast-host");if(!e)return;const t=document.createElement("div");t.className="confetti";for(let n=0;n<34;n++){const s=document.createElement("i");s.style.cssText=`--x:${Math.floor(i()*100)}vw;--d:${1.8+i()*1.8}s;--r:${Math.floor(i()*540)}deg;--c:${i()>.5?"var(--accent)":"var(--team)"}`,t.appendChild(s)}e.appendChild(t),setTimeout(()=>t.remove(),4200),gt(`The ${we(k.teamId).name} era begins. Make it legendary.`)}ii.addEventListener("click",i=>{const e=i.target.closest("[data-action]");if(!e)return;const t=e.dataset.action;if(t==="audio-toggle"){nn.toggle(),$e(!0);return}if(nn.unlock(),["speed","minutes"].includes(t)||nn.play("click"),t==="draft-pick"&&nn.play("draft"),t==="new-game")k.screen="team",k.tab="overview",$e();else if(t==="continue"&&At)k.seed=At.seed,k.teamId=At.teamId,k.screen="hub",Dt.setTeam(we(k.teamId)),$e();else if(t==="title")k.screen="title",$e();else if(t==="select-team")s_(e.dataset.team);else if(t==="close-sheet")document.getElementById("team-sheet-host").innerHTML="";else if(t==="confirm-team"){const n=document.getElementById("seed-input");k.seed=(n?.value.trim()||Uc).toUpperCase(),V=so(k.seed),li(V),k.lastResult=null,k.leagueMode="standings",k.screen="hub",k.tab="overview",xt(),Dt.setTeam(we(k.teamId)),$e(),$s()}else if(t==="tab")k.tab=e.dataset.tab,k.screen="hub",$e(),document.querySelector(".hub-content")?.scrollTo(0,0);else if(t==="league-mode")k.tab="league",k.leagueMode=e.dataset.mode,k.screen="hub",$e(),document.querySelector(".hub-content")?.scrollTo(0,0);else if(t==="roster-mode")k.rosterMode=e.dataset.mode,$e(),document.querySelector(".hub-content")?.scrollTo(0,0);else if(t==="minutes"){const n=Ye.find(r=>r.id===e.dataset.player),s=Ye.indexOf(n);_g(V,k.teamId,n.id,V.league.rotations[k.teamId][s]+Number(e.dataset.delta)),xt(),$e(!0)}else if(t==="make-starter")vg(V,k.teamId,e.dataset.player),xt(),$e(!0),gt("Starting five updated. The new rotation is ready.");else if(t==="extend-contract"){const n=Mg(V,k.teamId,e.dataset.player);n.ok?(xt(),$e(!0),gt(`${n.player.name} signs for three more years. Morale +6.`)):gt(n.reason)}else if(t==="accept-trade"){const n=xg(V,k.teamId,e.dataset.offer);n.ok?(xt(),$e(!0),gt(`Trade complete · ${n.receive.name} is joining ${we(k.teamId).city}.`)):gt(n.reason)}else if(t==="sign-open")document.getElementById("modal-host").innerHTML=Oc(e.dataset.player);else if(t==="sign-confirm"){const n=yg(V,k.teamId,document.getElementById("sign-player")?.value,document.getElementById("release-select")?.value);n.ok?(xt(),$e(!0),gt(`${n.signed.name} signs. ${n.outgoing.name} enters free agency.`)):gt(n.reason)}else if(t==="player")k.playerId=e.dataset.player,document.getElementById("modal-host").innerHTML=__(k.playerId);else if(t==="owner")k.screen==="hub"&&(document.getElementById("modal-host").innerHTML=v_());else if(t==="owner-stance")k.stance=e.dataset.stance,xt(),$e(),gt(k.stance==="contender"?"The owner expects a contender. The pressure is on.":"The owner backs your long-term vision.");else if(t==="start-sim")x_();else if(t==="quick-sim")y_();else if(t==="sim-season"&&V.phase==="regular")Ng(V),k.leagueMode="playoffs",k.tab="league",xt(),$e(),gt(`${V.awards.mvp.name} wins MVP. The playoff bracket is set.`);else if(t==="sim-playoffs"&&V.phase==="playoffs")Og(V),xt(),$e(),gt(`${we(V.playoffs.championId).city} wins the ${V.year} championship.`),V.playoffs.championId===k.teamId&&$s();else if(t==="begin-offseason"){const n=Hg(V,k.teamId);n.ok?(k.tab="overview",k.draftPage=0,k.draftFilter="ALL",xt(),$e(),$s()):gt(n.reason)}else if(t==="scout-player"){const n=zg(V,e.dataset.player);n.ok?(xt(),$e(!0)):gt(n.reason)}else if(t==="draft-filter")k.draftFilter=e.dataset.filter,k.draftPage=0,$e(!0);else if(t==="draft-page")k.draftPage=Math.max(0,k.draftPage+Number(e.dataset.delta)),$e(!0);else if(t==="open-draft")Gg(V,k.teamId),k.draftFilter="ALL",k.draftPage=0,xt(),$e();else if(t==="draft-pick"){const n=$g(V,k.teamId,e.dataset.player);n.ok?(xt(),$e(),$s()):gt(n.reason)}else if(t==="next-season"){const n=Wg(V);n.ok?(k.lastResult=null,k.leagueMode="standings",xt(),Dt.setWarmup(),$e(),gt(`Season ${V.dynasty.number} begins. Your rookie is ready.`)):gt(n.reason)}else if(t==="export-save"){xt();const n=new Blob([Xg(At)],{type:"application/json"}),s=URL.createObjectURL(n),r=document.createElement("a");r.href=s,r.download=`BSCFD-${k.teamId}-${V.year}.json`,r.click(),setTimeout(()=>URL.revokeObjectURL(s),1e3),gt("Dynasty exported. Keep this file somewhere safe.")}else t==="import-open"?document.getElementById("save-import")?.click():t==="exit-sim"?Ll(!1):t==="pause-sim"?(vn=!vn,$e()):t==="speed"?(hs=Number(e.dataset.speed)||1,$e()):t==="focus"?(Te?.setTactics(Te.userSide||"home",{focus:e.dataset.focus}),$e()):t==="timeout"?Te?.callTimeout(Te.userSide||"home")?(Dl("Momentum boost active for the next three possessions."),rr(Te)):Dl("No timeouts remaining."):t==="coach-toggle"?(or=!or,$e()):t==="sim-end"&&Te?(Te.runToEnd(),rr(Te),ao()):t==="return-hub"?Ll(!0):t==="box-score"&&Te?document.getElementById("result-host").innerHTML=gg(Te):t==="close-box"&&Te?document.getElementById("result-host").innerHTML=xc(Te):t==="close-modal"&&(document.getElementById("modal-host").innerHTML="")});ii.addEventListener("change",async i=>{if(i.target.id==="release-select"&&(document.getElementById("modal-host").innerHTML=Oc(document.getElementById("sign-player")?.value,i.target.value)),i.target.id==="save-import")try{const e=i.target.files?.[0];if(!e)return;const t=Yg(JSON.parse(await e.text()));V=t.season,k.seed=t.seed,k.teamId=t.teamId,k.stance=t.stance||"uncommitted",k.lastResult=t.lastResult||null,k.tab="overview",k.screen="hub",At=t,Ft(V),li(V),xt(),Dt.setTeam(we(k.teamId)),Dt.setWarmup(),$e(),gt("Dynasty imported. Your legacy continues.")}catch(e){gt(e.message||"That league file could not be imported.")}});ii.addEventListener("input",i=>{const e=i.target.closest("[data-tactic]");if(!e||!Te)return;const t=e.dataset.tactic;Te.setTactics(Te.userSide||"home",{[t]:Number(e.value)});const n=document.getElementById(`${t}-value`);n&&(n.textContent=e.value)});addEventListener("keydown",i=>{i.key.toLowerCase()==="m"&&!["INPUT","SELECT","TEXTAREA"].includes(document.activeElement?.tagName)&&(nn.toggle(),$e(!0)),i.key==="Escape"&&(document.getElementById("modal-host")?.replaceChildren(),document.getElementById("team-sheet-host")?.replaceChildren()),i.key===" "&&k.screen==="title"?(i.preventDefault(),k.screen="team",$e()):i.key===" "&&k.screen==="simcast"&&!Te?.state.finished&&(i.preventDefault(),vn=!vn,$e())});window.__seek=i=>Dt.seek(i);window.__play=()=>Dt.play();window.__audioProbe=()=>({enabled:nn.enabled,state:nn.context?.state||"not-created",crowd:!!nn.crowd});window.__gameProbe=()=>{const i=Te?.userSide||"home";return{screen:k.screen,tab:k.tab,teamId:k.teamId,seed:k.seed,rosterCount:Ye.length,hasSave:!!At,season:{year:V.year,phase:V.phase,round:V.round,games:Object.keys(V.results).length,checksum:pr(V),record:V.records[k.teamId],injuries:Object.keys(V.injuries).length,championId:V.playoffs?.championId||null,playoffRound:V.playoffs?.round??null},game:Te?{homeScore:Te.state.homeScore,awayScore:Te.state.awayScore,period:Te.state.period,clock:Te.state.clock,finished:Te.state.finished,checksum:Te.result?.checksum||null,speed:hs,paused:vn,focus:Te.tactics[i].focus,pace:Te.tactics[i].pace,defense:Te.tactics[i].defense,timeouts:Te.state.timeouts[i]}:null,...Dt.stats()}};$e();window.__SCENE_READY__=!0;const Ul=new URLSearchParams(location.search).get("t");Ul!==null&&Dt.seek(Ul);
