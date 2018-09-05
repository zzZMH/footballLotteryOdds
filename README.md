
# 足彩24小时赔率曲线展示

# 比赛信息列表
http://60.205.224.2:8080/oddsInfo.html

# 赔率曲线展示
http://60.205.224.2:8080/oddLines.html

后台利用node-schedule模块设置每10分钟获取赔率数据并存入数据库<br>
前台利用ECharts将数据变化趋势展示出来<br>
启动时利用forever将nodejs程序持久运行<br>
