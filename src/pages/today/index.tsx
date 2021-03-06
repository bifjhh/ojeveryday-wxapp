import Taro, { Component, Config } from "@tarojs/taro";
import { View, Text, Button } from "@tarojs/components";
import "./index.scss";
// import Statistical from "./statistical";
import { NetworkManager } from "./../../network/network";
import "taro-ui/dist/style/components/action-sheet.scss";
import "taro-ui/dist/style/components/icon.scss";

import { AtActionSheet, AtActionSheetItem } from "taro-ui"

interface ITodayProblem {
  indexNum?: string;
  name?: string;
  questionTitleSlug?: string;
  cnUrl: string;
  enUrl?: string;
}
interface IDate {
  year?: string;
  month?: string;
  day?: string;
}

interface IStatistical {
  checkedCount?: number | string;
  totalUserCount?: number | string;
  checkRatio?: string;
}

interface ITodayProblemState {
  todayProblem: ITodayProblem;
  statistical: IStatistical;
  date: IDate;
  showShare: boolean;
  isOpened: boolean;
}

class Day extends Component<ITodayProblem, ITodayProblemState> {
  // 发送请求
  statistical: IStatistical;
  constructor() {
    super();
    Taro.showLoading({
      title: '加载中...'
    })
    this.state = {
      todayProblem: {
        cnUrl: '',
      },
      isOpened: false,
      date: {},
      statistical: {
        checkedCount: "0",
        totalUserCount: "0",
        checkRatio: "0"
      },
      showShare: false
    };
  }

  config: Config = {
    navigationBarTitleText: "每日一题",
    navigationBarBackgroundColor: "#E5EAF5"
  };

  async componentDidShow() {
    this.setState({
      showShare: false
    })
    await this.getTodayProblem();
    await this.getSummary();
    Taro.hideLoading()
  }

  /**
   * 打开力扣webview
   * @param outerUrl 打开力扣的地址
   */
  toLeetcode(outerUrl?: string) {
    const url = `/pages/leetcode/index?outerUrl=${outerUrl}`;
    Taro.navigateTo({ url });
  }

  /**
   * 获取每日一题信息
   */
  async getTodayProblem() {
    let res = await NetworkManager.getTodayProblem();
    res = res[0];
    const date = {
      year: String(new Date(res.date).getFullYear()),
      month: String(new Date(res.date).getMonth() + 1),
      day: String(new Date(res.date).getDate())
    };
    date.month = date.month.length === 2 ? date.month : "0" + date.month;
    this.setState({
      todayProblem: res,
      date
    });
  }

  /**
   * 获取统计信息
   */
  async getSummary() {
    const res = await NetworkManager.getSummary();
    this.setState({
      statistical: res
    });
  }
  getProgressWidth() {
    let width = Number(this.state.statistical.checkedCount) / Number(this.state.statistical.totalUserCount) * 100
    width = width > 100 ? 100 : Number(width.toFixed(2))
    return ({ width: width + "%" })
  }
  componentDidHide() {
    setTimeout(() => {
      this.setState({
        showShare: false
      })
    }, 0);
  }
  /**
   * 页面右上角转发
   */
  onShareAppMessage() {
    this.setState({
      showShare: true
    })
    return {
      title: '每日一题'
    }
  }

  setClipboardData(url) {
    Taro.setClipboardData({
      data: url
    })
  }

  render() {
    return (
      <View className={this.state.showShare ? "today show_share" : "today"}>
        <View className="banner">
          <View className="back">
            <View className="date">
              <View className="date_box">
                <View className="day">
                  {this.state.date.day}
                </View>
                <View className="datetime">
                  <Text className="month">{this.state.date.month}.</Text>
                  <Text className="year">{this.state.date.year}</Text>
                </View>
              </View>

            </View>
            {/* <View className="problem">
              {this.state.todayProblem.indexNum}. {this.state.todayProblem.questionTitleSlug}
            </View> */}
            <View className="problem">
              {this.state.todayProblem.indexNum}. {this.state.todayProblem.name}
            </View>
            <View className="progress">
              <View className="bar" style={this.getProgressWidth()}></View>
            </View>
            <View className="footer">
              <Text># 每日LeetCode</Text>
              <Text
                onClick={() => {
                  Taro.navigateTo({
                    url: "/pages/rank/index"
                  });
                }}
              >
                已打卡: {this.state.statistical.checkedCount}/
                {this.state.statistical.totalUserCount}
                <Text className="at-icon at-icon-chevron-right"></Text>
              </Text>
            </View>
          </View>
        </View>
        <View className="bottom_box">
          <View
            className="to_lc"
            onClick={() => this.setState({ isOpened: true })}
          >
            前往打卡
          </View>
          <View className="bottom_r">
            <View className="ranking"
              onClick={() => {
                Taro.navigateTo({
                  url: "/pages/rank/index"
                });
              }}
            >
              <View className='at-icon at-icon-list'></View>
              <Text>打卡排名</Text>
            </View>
            <View className="share"
              onClick={() => {
                this.setState({
                  showShare: true
                })
              }}
            >
              <Button openType="share">
                <View className='at-icon at-icon-upload'></View>
                <Text>分享</Text>
              </Button>
            </View>
          </View>
        </View>
        <AtActionSheet isOpened={this.state.isOpened} cancelText='取消' title='点击下列按钮，会自动复制题目链接，前往浏览器粘贴打开即可'>
          <AtActionSheetItem onClick={() => this.setClipboardData(this.state.todayProblem.cnUrl)}>
            复制中文版力扣地址
          </AtActionSheetItem>
          <AtActionSheetItem onClick={() => this.setClipboardData(this.state.todayProblem.enUrl)}>
            复制英文版 LeetCode 地址
          </AtActionSheetItem>
        </AtActionSheet>
      </View>
    );
  }
}
export default Day;
