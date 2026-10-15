import cv2, numpy as np, json
from PIL import Image
A="/workspace/r14-assets/"; CX=448; W,H=896,1200
def mask(k,v): return np.array(Image.open(f"{A}{k}-male-{v}.webp"))[...,3]>12
yy,xx=np.mgrid[0:H,0:W]
def coords(m):
    """per-pixel t (0 inner .. 1 outer, per row & side) and s (0 top .. 1 bottom, per side)."""
    t=np.zeros((H,W)); s=np.zeros((H,W)); dx=np.abs(xx-CX)
    for side in (xx<CX, xx>=CX):
        ms=m&side
        if not ms.any(): continue
        ys=np.nonzero(ms)[0]; y0,y1=ys.min(),ys.max(); s[ms]=(yy[ms]-y0)/max(1,y1-y0)
        for y in np.unique(ys):
            row=ms[y]; d=dx[y][row]; lo,hi=d.min(),d.max(); t[y][row]=(d-lo)/max(1,hi-lo)
    return t,s
OUT={"front":{},"back":{}}
def add(v,sub,m):
    m=cv2.morphologyEx(m.astype(np.uint8),cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
    cs,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
    for c in cs:
        if cv2.contourArea(c)<60: continue
        a=cv2.approxPolyDP(c,1.3,True)[:,0,:]
        OUT[v].setdefault(sub,[]).append(["M"+" L".join(f"{x} {y}" for x,y in a)+"Z",CUR[0]])
CUR=[None]
def split(v,key,rules,default):
    CUR[0]=key
    m=mask(key,v); t,s=coords(m); left=m.copy()
    for sub,f in rules:
        sm=left&f(t,s); add(v,sub,sm); (None if sub in OUT[v] else print("EMPTY",v,sub)); left&=~sm
    add(v,default,left)
# FRONT
split("front","Chest",[("chest-clav",lambda t,s:s<0.36),("chest-lower",lambda t,s:s>0.72)],"chest-sternal")
split("front","Shoulders",[("delt-side",lambda t,s:t>0.55)],"delt-front")
split("front","Biceps",[("brachialis",lambda t,s:(s>0.78)&(t>0.35)),("biceps-short",lambda t,s:t<0.5)],"biceps-long")
split("front","Forearms",[("forearm-flexors",lambda t,s:t<0.55),("brachioradialis",lambda t,s:s<0.45)],"forearm-extensors")
split("front","Abs",[("abs-upper",lambda t,s:s<0.45)],"abs-lower")
split("front","Obliques",[("serratus",lambda t,s:s<0.16)],"obliques")
split("front","Quadriceps",[("quad-vl",lambda t,s:t>0.6),("quad-vm",lambda t,s:(t<0.4)&(s>0.6))],"quad-rf")
split("front","Adductors",[("adductor-longus",lambda t,s:s<0.3),("gracilis",lambda t,s:t<0.4)],"adductors-sub")
split("front","Abductors",[],"tfl")
# BACK
split("back","Shoulders",[("delt-side",lambda t,s:t>0.55)],"delt-rear")
split("back","Triceps",[("triceps-medial",lambda t,s:s>0.78),("triceps-long",lambda t,s:t<0.45)],"triceps-lateral")
split("back","Forearms",[("forearm-flexors",lambda t,s:t<0.28),("brachioradialis",lambda t,s:(t>0.6)&(s<0.35))],"forearm-extensors")
split("back","Traps",[("traps-upper",lambda t,s:s<0.3),("traps-mid",lambda t,s:s<0.46),("rhomboids",lambda t,s:(s<0.62)&(t<0.6))],"traps-lower")
split("back","Back",[("teres-major",lambda t,s:(s<0.13)&(t>0.45))],"lats")
split("back","Lumbars",[],"erectors")
split("back","Abductors",[],"glute-med")
split("back","Glutes",[("glute-med",lambda t,s:(s<0.3)&(t>0.3))],"glute-max")
split("back","Hamstrings",[("ham-semimem",lambda t,s:t<0.3),("ham-medial",lambda t,s:t<0.56)],"ham-lateral")
split("back","Calves",[("soleus",lambda t,s:s>0.6)],"gastroc")
# hand-placed (no Gymkee mask): left half, mirrored
def poly(v,sub,pts):
    for P in (pts,[(W-x,y) for x,y in pts]):
        OUT[v].setdefault(sub,[]).append(["M"+" L".join(f"{x} {y}" for x,y in P)+"Z",None])
poly("back","rotator-cuff",[(335,255),(372,262),(392,300),(385,330),(350,334),(330,300)])
poly("front","traps-upper",[(398,190),(402,212),(370,226),(338,240),(352,222),(378,204)])
poly("front","tibialis",[(352,842),(372,840),(378,880),(370,950),(360,1000),(350,996),(346,940),(344,880)])
OUT["pins"]={"front":{"transverse":[425,530],"hip-flexors":[372,598],"quad-vi":[372,720]},"back":{"glute-min":[372,548]}}
json.dump(OUT,open("/workspace/r14-gen/map.json","w"))
print({v:{k:len(x) for k,x in OUT[v].items()} for v in ("front","back")})
