# 最终幻想 XIV raid 计划工具

https://xivplan.netlify.app/

这是一个用于快速绘制最终幻想 XIV 攻略示意图的工具，灵感来源于 [RaidPlan.io](https://raidplan.io)。

## 使用方法

点击右上角的**帮助**或按 F1，查看界面说明以及键盘和鼠标快捷键列表。

左侧面板可调整场地外观，并通过拖放向场地添加对象。

点击场景中的对象进行选择。拖动出现的控制柄可调整对象的大小和形状，拖动对象的其他位置可移动对象。

右侧面板显示当前场景中的所有对象列表。你可以在此选择和删除对象，也可以通过拖放列表中的对象来更改它们的图层顺序（列表顶部的对象会显示在底部对象的上方）。

右侧面板还可以更改所选对象的详细属性。如果选中了多个对象，则可以更改所有对象共有的任何属性。如果某个属性的控件没有显示值，说明所选对象的该属性值不同。

在视图顶部，可以添加新的步骤并在步骤之间切换。

### 保存和分享计划

所有计划都存储在你的电脑本地。如果你使用的是基于 Chromium 的浏览器，可以直接保存到电脑上的文件中。否则，可以使用浏览器存储。如果使用浏览器存储，请确保不要清除此网站的浏览数据，否则你将丢失所有计划！

使用本地存储意味着我不需要支付服务器费用，而且我也不会不小心弄乱或删除你的计划，但分享计划会更麻烦。点击顶部的**分享**按钮获取可分享的链接。整个计划文件都编码在链接中，所以如果文件太大无法通过链接分享，你也可以将计划下载为.xivplan 文件进行分享。要打开共享文件，只需将其拖放到页面上即可。

如果你使用基于 Chromium 的浏览器并将该网站安装为应用程序，那么.xivplan 文件也可以直接在应用程序中打开，而无需使用拖放功能。

### 背景图片

当加载 SVG 文件作为场地背景图片时，XIVPlan 会注入以下 CSS 变量：

| 变量名                       | 描述                               |
| ---------------------------- | ---------------------------------- |
| `--xiv-colorBackground`      | 场地外部背景的颜色。               |
| `--xiv-colorArena`           | 场地地面的颜色。                   |
| `--xiv-colorArenaLight`      | 稍浅的场地地面颜色。               |
| `--xiv-colorArenaDark`       | 稍深的场地地面颜色。               |
| `--xiv-colorBorder`          | 场地地面周围边框的颜色。           |
| `--xiv-colorBorderTickMajor` | 启用边框刻度时，主要刻度线的颜色。 |
| `--xiv-colorBorderTickMinor` | 启用边框刻度时，次要刻度线的颜色。 |
| `--xiv-colorGrid`            | 网格线的颜色。                     |

## 替代工具

[RaidPlan.io](https://raidplan.io/ffxiv) 现在支持最终幻想 XIV。

[FF14 Toolbox Gaming Space](https://ff14.toolboxgaming.space) 是一个功能更强大的工具，支持动画等更多功能。不过我觉得它的界面使用起来比较繁琐，不太适合在攻略过程中快速绘制示意图。

## 致谢

撤销/重做逻辑基于 [frontendphil/react-undo-redo](https://github.com/frontendphil/react-undo-redo)

职业、角色、路标和敌人图标 © SQUARE ENIX CO., LTD. 保留所有权利。

[Limit cut 计数图标](https://magentalava.gumroad.com/l/limitcuticons) 由 yullanellis 制作。

部分 [场地背景图片](https://github.com/kotarou3/ffxiv-arena-images) 由 kotarou3 制作。
