export type FriendLinkItem = {
	title: string;
	url: string;
	avatar: string;
	desc: string;
	email: string;
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
				title: "Farewe1ll's Blog",
				url: "https://blog.farewe1ll.com",
				avatar: "https://avatar.farewe1ll.top",
				desc: "撥雪尋春，燒燈續晝。",
				email: "me@Farewe1ll.com",
			},
			{
				title: "Yukii_P's Blog",
				url: "https://blog.yukiip.top/",
				avatar: "https://s2.loli.net/2024/02/19/aZ9KP67BJNUWLgC.jpg",
				desc: "博闻善思",
				email: "",
			},
		],
	},
];
