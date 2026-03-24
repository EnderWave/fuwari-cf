---
title: ACM模板
published: 2026-03-21
tags:
  - 模板
category: 模板
draft: true
---
个人赛向
# 多项式部分
```cpp
#define N 3000050  
#define mod 998244353  
const ld PI=acos(-1.0);  
using std::string;  
string s1,s2;  
int read(){int p=0,flg=1;char c=getchar();while(c<'0'||c>'9'){if(c=='-') flg=-1;c=getchar();}while(c>='0'&&c<='9'){p=p*10+c-'0';c=getchar();}return p*flg;}  
void write(int x){if (!x)return;write(x/10);putchar(x%10+'0');}  
namespace Poly {  
    int p[N],q[N],r[N],w[N],invnum[N];  
    int add(int x,int y){return x+y>mod?x+y-mod:x+y;}  
    int dec(int x,int y){return x-y<0?x-y+mod:x-y;}  
    int ext(int n){return n==1?1:(1<<(std::__lg(n-1)+1));}  
    int qpow(int a,int b){int res=1;for (;b;b>>=1,a=1ll*a*a%mod)if (b&1)res=1ll*res*a%mod;return res;}  
    void get_r(int n){for (int i=0;i<n;i++)r[i]=(r[i>>1]>>1)|(i&1?n>>1:0);}  
    void print(int *a,int n){for (int i=0;i<n;i++)printf("%d%c",a[i]," \n"[i==n-1]);}  
    void init_poly(){  
        for(int k=2,m=1;k<=N;k<<=1,m<<=1){  
            w[m]=1;  
            for(int i=m+1,x=qpow(3,(mod-1)/k);i<k;i++) w[i]=1ll*w[i-1]*x%mod;  
        }invnum[1]=1;  
        for (int i=2;i<N;i++)invnum[i]=1ll*(mod-mod/i)*invnum[mod%i]%mod;  
    }  
    void NTT(int *a,int n,int op){  
        for (int i=0;i<n;i++)if (i<r[i])std::swap(a[i],a[r[i]]);  
        for (int k=2,m=1;k<=n;m<<=1,k<<=1){  
            for (int i=0;i<n;i+=k)  
                for (int j=i,*x=w+m;j<i+m;x++,j++){  
                    int v=1ll*a[j+m]*(*x)%mod;  
                    a[j+m]=dec(a[j],v);a[j]=add(a[j],v);  
                }  
        }  
        if (op==-1){  
            std::reverse(a+1,a+n);  
            for (int i=0,v=qpow(n,mod-2);i<n;i++)a[i]=1ll*a[i]*v%mod;  
        }  
    }  
    void mul(int *a,int *b,int n,int m){  
        if (!n||!m)return;  
        int len=ext(n+m-1);  
        for (int i=0;i<len;i++)p[i]=i<n?a[i]:0,q[i]=i<m?b[i]:0;  
        get_r(len);  
        NTT(p,len,1);NTT(q,len,1);  
        for (int i=0;i<len;i++)a[i]=1ll*p[i]*q[i]%mod;  
        NTT(a,len,-1);  
    }  
    void _inv(int *a,int *b,int n){  
        static int c[N],d[N];  
        n=ext(n);memset(b,0,4*n);b[0]=qpow(a[0],mod-2);  
        for (int k=2;k<=n;k<<=1){  
            for (int i=0;i<k<<1;i++)c[i]=i<k?a[i]:0,d[i]=i<k>>1?b[i]:0;  
            get_r(k);NTT(d,k,1);  
            for (int i=0;i<k;i++)d[i]=1ll*d[i]*d[i]%mod;  
            NTT(d,k,-1);get_r(k<<1);NTT(c,k<<1,1);NTT(d,k<<1,1);  
            for (int i=0;i<k<<1;i++)c[i]=1ll*c[i]*d[i]%mod;  
            NTT(c,k<<1,-1);  
            for (int i=0;i<k;i++)b[i]=(2ll*b[i]-c[i]+mod)%mod;  
        }  
    }  
    void _diff(int *a,int *b,int n){//a-n个数  
        for (int i=1;i<n;i++)b[i-1]=1ll*i*a[i]%mod;b[n-1]=0;  
    }  
    void _integ(int *a,int *b,int n){//b-n个数  
        for (int i=1;i<n;i++)b[i]=1ll*invnum[i]*a[i-1]%mod;b[0]=0;  
    }  
    void _ln(int *a,int *b,int n){  
        static int c[N],d[N];  
        assert(a[0]==1);  
        n=ext(n);  
        _inv(a,c,n),_diff(a,d,n),mul(c,d,n,n);_integ(c,b,n);  
    }  
    void _exp(int *a,int *b,int n){  
        static int c[N];  
        assert(a[0]==0);  
        n=ext(n);memset(b,0,4*n);memset(c,0,4*n);b[0]=1;  
        for (int k=2;k<=n;k<<=1){  
            _ln(b,c,k);  
            for (int i=0;i<k;i++)c[i]=dec(a[i],c[i]);  
            c[0]++;mul(b,c,k,k);  
  
        }  
    }  
    void _sqrt(int *a,int *b,int n){  
        static int c[N],d[N];  
        static const int inv2=(mod+1)>>1;  
        assert(a[0]==1);  
        n=ext(n);memset(b,0,4*n);b[0]=1;  
        for (int k=2;k<=n;k<<=1){  
            memcpy(c,a,4*k);_inv(b,d,k),mul(c,d,k,k);  
            for (int i=0;i<k;i++)b[i]=1ll*(b[i]+c[i])*inv2%mod;  
        }  
    }  
    void _pow(int *a,int *b,int n,string k){  
        static int c[N],d[N];  
        int u=0,k1=0,k2=0;  
        memset(b,0,4*n);  
        for (int i=0;i<k.size();i++)k1=(10ll*k1+k[i]-'0')%mod,k2=(10ll*k2+k[i]-'0')%(mod-1);  
        for (u=0;u<n&&!a[u];u++);  
        if ((u&&k.size()>=5)||1ll*u*k1>=n)return;  
        for (int i=u,x=qpow(a[u],mod-2);i<n;i++)c[i-u]=1ll*a[i]*x%mod;  
        _ln(c,d,n-u);  
        for (int i=0;i<n-u;i++)d[i]=1ll*d[i]*k1%mod;  
        _exp(d,c,n-u);  
        for (int i=u*k1,x=qpow(a[u],k2);i<n;i++)b[i]=1ll*c[i-u*k1]*x%mod;  
    }  
    void _pow_p(int *a,int *b,int n,string k){  
        static int c[N],d[N];  
        int u=0,k1=0,k2=0;  
        for (int i=0;i<k.size();i++)k1=(10ll*k1+k[i]-'0')%mod;  
        _ln(a,d,n);  
        for (int i=0;i<n;i++)d[i]=1ll*d[i]*k1%mod;  
        _exp(d,b,n);  
    }  
    void _div(int *a,int *b,int *q,int *r,int n,int m){  
        static int c[N],d[N],e[N];  
        int len=n-m+1;  
        for (int i=0;i<len;i++)c[i]=a[n-1-i];  
        for (int i=0;i<len;i++)d[i]=i<m?b[m-1-i]:0;  
        _inv(d,e,len);mul(c,e,len,len),std::reverse(c,c+len);  
        memcpy(q,c,4*len),mul(c,b,len,m);  
        for (int i=0;i<m;i++)r[i]=dec(a[i],c[i]);  
    }  
}  
using namespace Poly;
```
# 数论部分
```cpp
//埃筛
int vis[N],pri[N],cnt;
void Eratosthenes(int n){
    vis[0]=vis[1]=0;cnt=0;
    for(int i=2;i<=n;i++)vis[i]=1;
    for (int i=2;i<=n;i++){
        if (vis[i]){
            pri[cnt++]=i;
            if (1ll*i*i>n)continue;
            for (int j=i*i;j<=n;j+=i){
                vis[j]=0;
            }
        }
    }
}
//欧拉筛
void Euler(int n){
    cnt=0;
    for (int i=2;i<=n;i++)vis[i]=0;
    for (int i=2;i<=n;i++){
        if (!vis[i])pri[cnt++]=i;
        for (int j=1;j<=cnt;j++){
            if (1ll*i*pri[j]>n)break;
            vis[i*pri[j]]=1;
            if (i%pri[j]==0)break;
        }
    }
}
//phi
int phi[N];
void get_phi(int n){
    cnt=0;phi[1]=1;
    for (int i=2;i<=n;i++)vis[i]=0;
    for (int i=2;i<=n;i++){
        if (!vis[i])pri[++cnt]=i,phi[i]=i-1;
        for (int j=1;j<=cnt;j++){
            if (1ll*i*pri[j]>n)break;
            if (i%pri[j]==0){
                vis[i*pri[j]]=1;phi[i*pri[j]]=pri[j]*phi[i];
                break;
            }
            vis[i*pri[j]]=1;phi[i*pri[j]]=(pri[j]-1)*phi[i];
        }
    }
}
//mu
int mu[N];
void get_mu(int n){
    cnt=0;mu[1]=1;
    for (int i=2;i<=n;i++)vis[i]=0;
    for (int i=2;i<=n;i++){
        if (!vis[i])pri[++cnt]=i,mu[i]=-1;
        for (int j=1;j<=cnt;j++){
            if (1ll*i*pri[j]>n)break;
            if (i%pri[j]==0){
                vis[i*pri[j]]=1;mu[i*pri[j]]=0;
                break;
            }
            vis[i*pri[j]]=1;mu[i*pri[j]]=-mu[i];
        }
    }
}
//约数个数
int d[N],num[N];
void get_d(int n){
    cnt=0;d[1]=1;
    for (int i=2;i<=n;i++)vis[i]=0;
    for (int i=2;i<=n;i++){
        if (!vis[i])pri[++cnt]=i,d[i]=2,num[i]=1;
        for (int j=1;j<=cnt;j++){
            if (1ll*i*pri[j]>n)break;
            if (i%pri[j]==0){
                vis[i*pri[j]]=1;num[i*pri[j]]=num[i]+1;d[i*pri[j]]=d[i]*(num[i*pri[j]]+1)/num[i*pri[j]];
                break;
            }
            vis[i*pri[j]]=1;num[i*pri[j]]=1;d[i*pri[j]]=2*d[i];
        }
    }
}
//约数和
int dsum[N],gsum[N];
void get_dsum(int n){
    cnt=0;dsum[1]=1;
    for (int i=2;i<=n;i++)vis[i]=0;
    for (int i=2;i<=n;i++){
        if (!vis[i])pri[++cnt]=i,dsum[i]=1+i,gsum[i]=1+i;
        for (int j=1;j<=cnt;j++){
            if (1ll*i*pri[j]>n)break;
            if (i%pri[j]==0){
                vis[i*pri[j]]=1;
                gsum[i*pri[j]]=pri[j]*gsum[i]+1;
                dsum[i*pri[j]]=dsum[i]*(gsum[i*pri[j]])/gsum[i];
                break;
            }
            vis[i*pri[j]]=1;
            gsum[i*pri[j]]=1+pri[j];
            dsum[i*pri[j]]=(1+pri[j])*dsum[i];
        }
    }
}
//狄利克雷卷积
for(int i = 1; i <= tot; i++) {
    for(int j = n / pri[i]; j >= 1; j--) {
        int t = pri[i];
        for(long long k = j * pri[i]; k <= n; k *= pri[i]) {
            f[k] += f[j] * g[t];
            t *= pri[i];
        }
    }
}
void Dir(){//g积性
    for (int i=1;i<=cnt;i++){
        for (int j=n/pri[i];j>=1;j--){
            ll cnt=1,p=pri[i];
            for (ll k=j*p;k<=1ll*n;k*=p,cnt++){
                a[k]=add(a[k],1ll*a[j]*g[cnt]%mod);
            }
        }
    }
}
int exgcd(int a,int b,int& x,int& y){
    if (!b)return x=1,y=0,a;
    int d=exgcd(b,a%b,x,y);
    int t=x;
    x=y;
    y=t-(a/b)*y;
    return d;
}
int a[N],r[N];
int crt(int k){
    int n=1,ans=0;
    for (int i=1;i<=k;i++)n*=r[i];
    for (int i=1;i<=k;i++){
        int m=n/r[i];
        ans=(ans+a[i]*m*pow(m,r[i])%n)%n;
    }
    return (ans%n+n)%n;
}
ll BSGS(ll a,ll b,ll p){
    mp.clear();
    if (b==1)return 0;
    a%=p;b%=p;ll m=ceil(sqrt(p)),res=1;
    for (int i=0;i<m;i++){
        if (!mp.count(res))mp[res]=i;
        res=(res*a)%p;
    }
    ll A=inv(res,p);
    res=b;
    for (int i=0;i<m;i++){
        if (mp.count(res))return i*m+mp[res];
        res=res*A%p;
    }
    return -1;
}
ll Lucas(ll n,ll m){
	if(!m)return 1;
	return C(n%p,m%p)*Lucas(n/p,m/p)%p;
}

```
# 线性代数部分
```cpp
//线性基
bool insert(int x){
    for (int i=30;i>=0;i--){
        if (x>>i&1){
            if (!val[i]){
                val[i]=x;cnt++;
                return 1;
            }
            x^=val[i];
        }
    }
    return 0;
}
//第k小
int qry_kth(int k){
    int ans=0,ct=1<<cnt;
    for (int i=30;i>=0;i--){
        if (val[i]){
            if (k>(ct>>=1)){
                k-=ct;
                if (~ans>>i&1)ans^=val[i];
            }
            else if (ans>>i&1)ans^=val[i];
        }
    }
    return ans;
}
//求排名
int qry_rk(int x){
    int ans=0,ct=(1<<cnt),pre=0;x++;
    for (int i=30;i>=0;i--){
        if (val[i]){
            ans+=(x>>i&1)*(ct>>=1);
            if ((x^pre)>>i&1)pre^=val[i];
        }
        else if ((x^pre)>>i&1){
            if (x>>i&1)ans+=ct;
            break;
        }
    }
    return ans;
}
```
# 图论部分
```cpp
//数剖
struct edge{
	int v,nex;
}e[N<<1];
void add(int u,int v){
	e[++cnt]={v,head[u]};head[u]=cnt;
}
struct segtree{
	#define ls (p<<1)
	#define rs (p<<1|1)
	#define mid ((l+r)>>1)
	int t[N<<2],tag[N<<2];
	void pushup(int p){
		t[p]=t[ls]+t[rs];t[p]%=mod;
	}
	void pushdown(int p,int l,int r){
		if(!tag[p])return;
		t[ls]+=tag[p]*(mid-l+1);t[ls]%=mod;
		t[rs]+=tag[p]*(r-mid);t[rs]%=mod;
		tag[ls]+=tag[p];tag[ls]%=mod;
		tag[rs]+=tag[p];tag[rs]%=mod;
		tag[p]=0;
	}
	void change(int p,int l,int r,int x,int y,int k){
		if(x>r||l>y)return;
		if(l>=x&&r<=y){
			t[p]+=(r-l+1)*k;tag[p]+=k;t[p]%=mod;tag[p]%=mod;
			return;
		}
		pushdown(p,l,r);
		change(ls,l,mid,x,y,k);
		change(rs,mid+1,r,x,y,k);
		pushup(p);
	}
	int qry(int p,int l,int r,int x,int y){
		if(x>r||l>y)return 0;
		if(l>=x&&r<=y)return t[p];
		pushdown(p,l,r);
		return (qry(ls,l,mid,x,y)+qry(rs,mid+1,r,x,y))%mod;
	}
}T;
void dfs1(int u,int f){
	siz[u]=1;fa[u]=f;dep[u]=dep[fa[u]]+1;
	for(int i=head[u];i;i=e[i].nex){
		int v=e[i].v;
		if(v==f)continue;
		dfs1(v,u);
		siz[u]+=siz[v];
		if(siz[v]>siz[son[u]])son[u]=v;
	}
}
void dfs2(int u,int topp){
	dfn[u]=++dfnct;
	top[u]=topp;
	T.change(1,1,n,dfn[u],dfn[u],w[u]);
	if(!son[u])return;
	dfs2(son[u],topp);
	for(int i=head[u];i;i=e[i].nex){
		int v=e[i].v;
		if(v==fa[u]||v==son[u])continue;
		dfs2(v,v);
	}
}
void upd_path(int u,int v,int k){
	while(top[u]!=top[v]){
		if(dep[top[u]]<dep[top[v]])swap(u,v);
		T.change(1,1,n,dfn[top[u]],dfn[u],k);
		u=fa[top[u]];
	}
	if(dep[u]<dep[v])swap(u,v);
	T.change(1,1,n,dfn[v],dfn[u],k);
}
ll qry_path(int u,int v){
	ll res=0;
	while(top[u]!=top[v]){
		if(dep[top[u]]<dep[top[v]])swap(u,v);
		res+=1ll*T.qry(1,1,n,dfn[top[u]],dfn[u]);res%=mod;
		u=fa[top[u]];
	}
	if(dep[u]<dep[v])swap(u,v);
	res+=1ll*T.qry(1,1,n,dfn[v],dfn[u]);
	return res%mod;
}
void upd_tree(int u,int k){
	T.change(1,1,n,dfn[u],dfn[u]+siz[u]-1,k);
}
ll qry_tree(int u){
	return 1ll*T.qry(1,1,n,dfn[u],dfn[u]+siz[u]-1)%mod;
}
//二分图最大匹配
bool dfs(int u,int falg){
	if(vis[u]==falg) return 0;
	vis[u]=falg;
	for(int i=0;i<g[u].size();i++){
		int v=g[u][i];
		if(!mat[v]||dfs(mat[v],falg)){
			mat[v]=u;
			return 1;
		}
	}
	return 0;
}

```
# 字符串部分
```cpp
//KMP
void pre(string s){
    int len=s.length();
    pi[0]=0;
    for (int i=1;i<len;i++){
        int j=pi[i-1];
        while(j&&s[i]!=s[j])j=pi[j-1];
        pi[i]=j+(s[i]==s[j]);
    }
}
//ACAM
namespace ACAM {
    struct tire{
        int son[26],fail,in,id,ans;
        void clear(){
            fail=in=id=ans=0;
            memset(son,0,sizeof(son));
        }
    }T[N];
    int cntid,cntn,ans[N];
    queue<int>Q;
    void init(){
        cntid=cntn=0;
        T[0].clear();
    }
    int insert(string s){//return id;
        int u=0,len=s.length();
        for (int i=0;i<len;i++){
            int& son=T[u].son[s[i]-'a'];//地址写法更方便
            if (!son)son=++cntn,T[son].clear();
            u=son;
        }
        if (!T[u].id)T[u].id=++cntid;//防止重复
        return T[u].id;//记录编号
    }
    void build(){
        //建立ac自动机
        while (!Q.empty()) Q.pop();
        for (int i=0;i<26;i++)
            if (T[0].son[i])Q.push(T[0].son[i]);
        while (!Q.empty()){
            int u=Q.front();Q.pop();
            for (int i=0;i<26;i++){
                if (T[u].son[i]){
                    T[T[u].son[i]].fail=T[T[u].fail].son[i];
                    T[T[T[u].fail].son[i]].in++;
                    Q.push(T[u].son[i]);
                }
                else T[u].son[i]=T[T[u].fail].son[i];//改变树的结构
            }
        }
    }
    void qry(string t){
        int u=0,len=t.length();
        for (int i=0;i<len;i++){
            u=T[u].son[t[i]-'a'];
            T[u].ans++;
        }
    }
    void topo(){
        while (!Q.empty()) Q.pop();
        for (int i=0;i<=cntn;i++){
            if (!T[i].in)Q.push(i);
        }
        while (!Q.empty()){
            int u=Q.front();Q.pop();
            ans[T[u].id]=T[u].ans;
            int v=T[u].fail;
            T[v].ans+=T[u].ans;
            if (!--T[v].in)Q.push(v);
        }
    }
}
```
# 数据结构部分
```cpp

for(int j=1;j<=logn;j++)
		for(int i=1;i+(1<<j)-1<=n;i++)
			d[i][j]=max(d[i][j-1],d[i+(1<<(j-1))][j-1]);
	for(int i=1;i<=m;i++){
		int x=read(),y=read();
		int s=longn[y-x+1];
		printf("%d\n",max(d[x][s],d[y-(1<<s)+1][s]));
	}

```
# STL部分
```cpp
### 插入与删除操作[](http://oi-wiki.com/lang/csl/associative-container/#%E6%8F%92%E5%85%A5%E4%B8%8E%E5%88%A0%E9%99%A4%E6%93%8D%E4%BD%9C "Permanent link")

- `insert(x)` 当容器中没有等价元素的时候，将元素 x 插入到 `set` 中．
- `erase(x)` 删除值为 x 的 **所有** 元素，返回删除元素的个数．
- `erase(pos)` 删除迭代器为 pos 的元素，要求迭代器必须合法．
- `erase(first,last)` 删除迭代器在 [𝑓𝑖𝑟𝑠𝑡,𝑙𝑎𝑠𝑡)![](data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7 "[first,last)") 范围内的所有元素．
- `clear()` 清空 `set`．

insert 函数的返回值

insert 函数的返回值类型为 `pair<iterator, bool>`，其中 iterator 是一个指向所插入元素（或者是指向等于所插入值的原本就在容器中的元素）的迭代器，而 bool 则代表元素是否插入成功，由于 `set` 中的元素具有唯一性质，所以如果在 `set` 中已有等值元素，则插入会失败，返回 false，否则插入成功，返回 true；`map` 中的 insert 也是如此．

### 迭代器[](http://oi-wiki.com/lang/csl/associative-container/#%E8%BF%AD%E4%BB%A3%E5%99%A8 "Permanent link")

`set` 提供了以下几种迭代器：

1. `begin()/cbegin()`  
    返回指向首元素的迭代器，其中 `*begin = front`．
2. `end()/cend()`  
    返回指向数组尾端占位符的迭代器，注意是没有元素的．
3. `rbegin()/crbegin()`  
    返回指向逆向数组的首元素的逆向迭代器，可以理解为正向容器的末元素．
4. `rend()/crend()`  
    返回指向逆向数组末元素后一位置的迭代器，对应容器首的前一个位置，没有元素．

以上列出的迭代器中，含有字符 `c` 的为只读迭代器，你不能通过只读迭代器去修改 `set` 中的元素的值．如果一个 `set` 本身就是只读的，那么它的一般迭代器和只读迭代器完全等价．只读迭代器自 C++11 开始支持．

### 查找操作[](http://oi-wiki.com/lang/csl/associative-container/#%E6%9F%A5%E6%89%BE%E6%93%8D%E4%BD%9C "Permanent link")

- `count(x)` 返回 `set` 内键为 x 的元素数量．
- `find(x)` 在 `set` 内存在键为 x 的元素时会返回该元素的迭代器，否则返回 `end()`．
- `lower_bound(x)` 返回指向首个不小于给定键的元素的迭代器．如果不存在这样的元素，返回 `end()`．
- `upper_bound(x)` 返回指向首个大于给定键的元素的迭代器．如果不存在这样的元素，返回 `end()`．
- `empty()` 返回容器是否为空．
- `size()` 返回容器内元素个数．
  |   |   |
|---|---|
||`// 现存可用的元素 set<int> available; // 需要大于等于的值 int x;  // 查找最小的大于等于x的元素 set<int>::iterator it = available.lower_bound(x); if (it == available.end()) {   // 不存在这样的元素，则进行相应操作…… } else {   // 找到了这样的元素，将其从现存可用元素中移除   available.erase(it);   // 进行相应操作…… }`|
`find(str,pos)` 函数可以用来查找字符串中一个字符/字符串在 `pos`（含）之后第一次出现的位置（若不传参给 `pos` 则默认为 `0`）．如果没有出现，则返回 `string::npos`（被定义为 `-1`，但类型仍为 `size_t`/`unsigned long`）．
`substr(pos, len)` 函数的参数返回从 `pos` 位置开始截取最多 `len` 个字符组成的字符串（如果从 `pos` 开始的后缀长度不足 `len` 则截取这个后缀）．
`insert(index,count,ch)` 和 `insert(index,str)` 是比较常见的插入函数．它们分别表示在 `index` 处连续插入 `count` 次字符串 `ch` 和插入字符串 `str`．

`erase(index,count)` 函数将字符串 `index` 位置开始（含）的 `count` 个字符删除（若不传参给 `count` 则表示删去 `index` 位置及以后的所有字符）．
`replace(pos,count,str)` 和 `replace(first,last,str)` 是比较常见的替换函数．它们分别表示将从 `pos` 位置开始 `count` 个字符的子串替换为 `str` 以及将以 `first` 开始（含）、`last` 结束（不含）的子串替换为 `str`，其中 `first` 和 `last` 均为迭代器．

```

