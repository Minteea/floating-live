import { DanmakuMode } from "../../src/enum";

export namespace RawMessage {
  interface Base {
    cmd: string;
    /** 消息id */
    msg_id?: string;
    /** 发送时间 */
    send_time?: number;
  }
  export interface DANMU_MSG extends Base {
    cmd: "DANMU_MSG";
    info: {
      0: {
        /** 弹幕模式 */
        1: DanmakuMode;
        /** 弹幕字号 */
        2: number;
        /** 弹幕颜色 */
        3: number;
        /** 时间戳 */
        4: number;
        /** 是否为图片信息 */
        12: number;
        /** 图片信息 */
        13: {
          /** 表情图片id */
          emoticon_unique: string;
          /** 表情图片url */
          url: string;
          /** 表情图片宽度 */
          width: number;
          /** 表情图片高度 */
          height: number;
        };
        /** 附加信息 */
        15: {
          extra: string;
        };
        /** 活动信息 */
        16: {
          /** 弹幕不在聊天栏显示 */
          not_show: number;
        };
      };
      /** 弹幕内容 */
      1: string;
      2: {
        /** 用户uid */
        0: number;
        /** 用户名 */
        1: string;
        /** 用户是否为房管 */
        2: number;
      };
      /** 粉丝勋章信息 */
      3: {
        /** 勋章等级 */
        0: number;
        /** 勋章名称 */
        1: string;
        /** 勋章id */
        12: number;
        /** 大航海级别 */
        10: number;
      };
      /** 大航海级别 */
      7: number;
    };
  }
  export interface INTERACT_WORD extends Base {
    cmd: "INTERACT_WORD";
    data: {
      /** 用户名 */
      uname: string;
      /** 用户id */
      uid: number;
      /** 互动类型 */
      msg_type: number;
      /** 触发时间*1000000 */
      trigger_time: number;
      /** 粉丝勋章 */
      fans_medal: {
        /** 勋章等级 */
        medal_level: number;
        /** 勋章名称 */
        medal_name: string;
        /** 勋章id */
        target_id: number;
        /** 大航海级别 */
        guard_level: number;
      };
    };
  }
  export interface SEND_GIFT extends Base {
    cmd: "SEND_GIFT";
    data: {
      /** 用户名 */
      uname: string;
      /** 用户id */
      uid: number;
      /** 用户头像 */
      face: string;
      /** 发送时间(s) */
      timestamp: number;
      /** 粉丝勋章 */
      fans_medal: {
        /** 勋章等级 */
        medal_level: number;
        /** 勋章名称 */
        medal_name: string;
        /** 勋章id */
        target_id: number;
        /** 大航海级别 */
        guard_level: number;
      };
      /** 大航海级别 */
      guard_level: number;
      /** 礼物名称 */
      giftName: string;
      /** 礼物id */
      giftId: number;
      /** 礼物总数 */
      num: number;
      total_coin: number;
      coin_type: string;
      action: string;
      combo_id: string;
      batch_combo_id: string;
    };
  }
  export interface GUARD_BUY extends Base {
    cmd: "GUARD_BUY";
    data: {
      /** 用户名 */
      username: string;
      /** 用户id */
      uid: number;
      /** 发送时间(s) */
      start_time: number;
      /** 大航海级别 */
      guard_level: number;
      /** 礼物名称 */
      gift_name: string;
      /** 礼物id */
      gift_id: number;
      /** 礼物总数 */
      num: number;
      /** 礼物价值 */
      price: number;
    };
  }
  export interface SUPER_CHAT_MESSAGE extends Base {
    cmd: "SUPER_CHAT_MESSAGE";
    data: {
      /** sc消息id */
      id: string;
      /** 用户id */
      uid: number;
      /** 用户信息 */
      user_info: {
        /** 用户名 */
        uname: string;
        /** 用户头像 */
        face: string;
        /** 大航海级别 */
        guard_level: number;
      };
      /** 粉丝勋章 */
      medal_info: {
        /** 勋章等级 */
        medal_level: number;
        /** 勋章名称 */
        medal_name: string;
        /** 勋章id */
        target_id: number;
        /** 大航海级别 */
        guard_level: number;
      };
      /** 发送时间(s) */
      ts: number;
      /** 礼物信息 */
      gift: {
        /** 礼物名称 */
        gift_name: string;
        /** 礼物id */
        gift_id: number;
        /** 礼物总数 */
        num: number;
      };
      /** 礼物价值 */
      price: number;
      /** 消息 */
      message: string;
      /** 颜色 */
      background_bottom_color: string;
      /** 消息 */
      time: number;
    };
  }
  export interface WATCHED_CHANGE extends Base {
    cmd: "WATCHED_CHANGE";
    data: {
      num: number;
    };
  }
  export interface LIKE_INFO_V3_UPDATE extends Base {
    cmd: "LIKE_INFO_V3_UPDATE";
    data: {
      click_count: number;
    };
  }
  export interface ONLINE_RANK_COUNT extends Base {
    cmd: "ONLINE_RANK_COUNT";
    data: {
      count?: number;
      online_count?: number;
    };
  }
  export interface ROOM_BLOCK_MSG extends Base {
    cmd: "ROOM_BLOCK_MSG";
    data: {
      /** 用户名 */
      uname: string;
      /** 用户id */
      uid: number;
      /** 执行操作的用户类型 */
      operator: number;
    };
  }
  export interface LIVE extends Base {
    cmd: "LIVE";
    /** 直播时间 */
    live_time: number;
    /** 直播id */
    live_key: string;
  }
  export interface CUT_OFF extends Base {
    cmd: "CUT_OFF";
    /** 切断消息 */
    msg: string;
  }
  export interface PREPARING extends Base {
    cmd: "PREPARING";
    /** 是否为轮播 */
    round?: number;
  }
  export interface ROOM_CHANGE extends Base {
    cmd: "ROOM_CHANGE";
    data: {
      title: string;
      parent_area_name: string;
      area_name: string;
    };
  }
  export type All =
    | DANMU_MSG
    | INTERACT_WORD
    | SEND_GIFT
    | GUARD_BUY
    | SUPER_CHAT_MESSAGE
    | WATCHED_CHANGE
    | LIKE_INFO_V3_UPDATE
    | ONLINE_RANK_COUNT
    | ROOM_BLOCK_MSG
    | LIVE
    | CUT_OFF
    | PREPARING
    | ROOM_CHANGE;
}

/** 接口返回的直播间信息
 * https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id={id} */
export interface RawInfo {
  room_info: {
    /** 用户uid */
    uid: number;
    /** 房间id */
    room_id: number;
    /** 短id */
    short_id: number;
    /** 直播间标题 */
    title: string;
    /** 直播间封面 */
    cover: string;
    /** 直播间标签 */
    tags: string;
    /** 直播间背景 */
    background: string;
    /** 直播间简介 */
    description: string;
    /** 直播状态 */
    live_status: number;
    /** 直播开始时间(s) */
    live_start_time: number;
    /** 是否被封禁 */
    lock_status: number;
    /** 封禁时间 */
    lock_time: number;
    /** 是否被隐藏 */
    hidden_status: number;
    /** 隐藏时间 */
    hidden_time: number;
    /** 分区id */
    area_id: number;
    /** 分区名 */
    area_name: string;
    /** 一级分区id */
    parent_area_id: number;
    /** 一级分区名 */
    parent_area_name: string;
    /** session */
    up_session: string;
    /** 直播场次id */
    live_id: number;
    /** 直播场次id */
    live_id_str: string;
    /** 观看数 */
    online: number;
  };
  /** 主播信息 */
  anchor_info: {
    /** 基本信息 */
    base_info: {
      /** 用户名 */
      uname: string;
      /** 头像 */
      face: string;
      /** 性别 */
      gender: string;
      /** 官方信息 */
      official_info: {
        role: number;
        title: string;
        desc: string;
      };
    };
    /** 直播信息 */
    live_info: {
      /** 主播等级 */
      level: number;
      /** 等级颜色 */
      level_color: number;
      /** 经验值 */
      score: number;
      /** 下一级所需经验值 */
      upgrade_score: number;
      /** 当前等级 */
      current: [number, number];
      /** 下一等级 */
      next: [number, number];
      /** 直播间排名 */
      rank: string;
    };
    /** 直播间粉丝牌信息 */
    medal_info: {
      /** 粉丝牌名称 */
      medal_name: string;
      /** 粉丝牌id */
      medal_id: number;
      /** 粉丝团成员数 */
      fansclub: number;
    };
  };
  /** 公告信息 */
  news_info: {
    /** uid */
    uid: number;
    /** 创建时间 */
    ctime: string;
    /** 公告内容 */
    content: string;
  };
  /** 分区排名信息 */
  area_rank_info: {
    areaRank: {
      index: number;
      rank: string;
    };
    liveRank: {
      rank: string;
    };
  };
  /** sc信息 */
  super_chat_info: {
    status: number;
    ranked_mark: number;
    message_list: [];
  };
  /** 在线榜单信息 */
  online_gold_rank_info_v2: {
    list: {
      uid: number;
      face: string;
      uname: string;
      score: string;
      rank: number;
      guard_level: number;
    }[];
  };
  watched_show: {
    num: number;
    text_small: string;
    text_large: string;
  };
  show_reserve_status: false;
  /** 点赞信息 */
  like_info_v3: {
    /** 总点赞数 */
    total_likes: number;
  };
  /** 大航海信息 */
  guard_info: {
    count: number;
    anchor_guard_achieve_level: number;
  };
  room_rank_info: {
    user_rank_entry: {
      /** 贡献榜排行 */
      user_contribution_rank_entry: {
        item: {
          uid: number;
          name: string;
          face: string;
          rank: number;
          score: number;
          medal_info: null;
          guard_level: number;
          wealth_level: number;
        }[];
        /** 贡献榜总数 */
        count: number;
        /** 最大显示数量 */
        show_max: number;
      };
    };
  };
}
