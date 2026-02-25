export type FriendLinkItem = {
	title: string;
	url: string;
	avatar: string;
	desc: string;
};

export type FriendLinkSection = {
	title: string;
	items: FriendLinkItem[];
};

export const friendLinkSections: FriendLinkSection[] = [
	{
		title: "🌟 友情博客",
		items: [
			{
				title: "博客园",
				url: "https://www.cnblogs.com/ZYPLJ/",
				avatar: "https://pljzy.top/images/logo4.jpg",
				desc: "技术分享与学习交流的园地",
			},
		],
	},
];
