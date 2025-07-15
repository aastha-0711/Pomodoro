"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Target } from "lucide-react"

// Mock data for the session history
const mockSessions = [
  { id: 1, date: "2023-05-01", duration: 25, focusLevel: 85, type: "pomodoro" },
  { id: 2, date: "2023-05-01", duration: 5, focusLevel: 0, type: "shortBreak" },
  { id: 3, date: "2023-05-01", duration: 25, focusLevel: 90, type: "pomodoro" },
  { id: 4, date: "2023-05-02", duration: 25, focusLevel: 75, type: "pomodoro" },
  { id: 5, date: "2023-05-02", duration: 5, focusLevel: 0, type: "shortBreak" },
  { id: 6, date: "2023-05-03", duration: 25, focusLevel: 95, type: "pomodoro" },
  { id: 7, date: "2023-05-03", duration: 15, focusLevel: 0, type: "longBreak" },
  { id: 8, date: "2023-05-04", duration: 25, focusLevel: 80, type: "pomodoro" },
  { id: 9, date: "2023-05-04", duration: 25, focusLevel: 88, type: "pomodoro" },
  { id: 10, date: "2023-05-05", duration: 25, focusLevel: 92, type: "pomodoro" },
  { id: 11, date: "2023-05-05", duration: 5, focusLevel: 0, type: "shortBreak" },
  { id: 12, date: "2023-05-06", duration: 25, focusLevel: 78, type: "pomodoro" },
  { id: 13, date: "2023-05-06", duration: 25, focusLevel: 82, type: "pomodoro" },
  { id: 14, date: "2023-05-07", duration: 25, focusLevel: 88, type: "pomodoro" },
]

// Colors for the charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function SessionHistoryDashboard() {
  const [timeRange, setTimeRange] = useState("week")

  // Filter sessions based on time range
  const filteredSessions = mockSessions

  // Calculate total focus time
  const totalFocusTime = filteredSessions
    .filter((session) => session.type === "pomodoro")
    .reduce((total, session) => total + session.duration, 0)

  // Calculate average focus level
  const focusSessions = filteredSessions.filter((session) => session.type === "pomodoro")
  const averageFocusLevel = focusSessions.length
    ? Math.round(focusSessions.reduce((sum, session) => sum + session.focusLevel, 0) / focusSessions.length)
    : 0

  // Prepare data for focus trend chart
  const focusTrendData = focusSessions.map((session) => ({
    date: new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    focusLevel: session.focusLevel,
  }))

  // Prepare data for session distribution chart
  const sessionTypes = filteredSessions.reduce(
    (acc, session) => {
      const type = session.type
      if (!acc[type]) {
        acc[type] = 0
      }
      acc[type] += 1
      return acc
    },
    {} as Record<string, number>,
  )

  const sessionDistributionData = Object.entries(sessionTypes).map(([name, value]) => ({
    name: name === "pomodoro" ? "Focus" : name === "shortBreak" ? "Short Break" : "Long Break",
    value,
  }))

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFocusTime} min</div>
              <p className="text-xs text-muted-foreground">
                {Math.floor(totalFocusTime / 60)} hours {totalFocusTime % 60} minutes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Focus Sessions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{focusSessions.length}</div>
              <p className="text-xs text-muted-foreground">{focusSessions.length * 25} minutes of focused work</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Focus</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageFocusLevel}%</div>
              <p className="text-xs text-muted-foreground">Average focus level during sessions</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="focus">Focus Trends</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Focus Level Trend</CardTitle>
                <CardDescription>Your focus level over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={focusTrendData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="focusLevel" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Session Distribution</CardTitle>
                <CardDescription>Breakdown of your session types</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sessionDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sessionDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="focus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Focus Duration</CardTitle>
              <CardDescription>Minutes spent focusing each day</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={focusTrendData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="focusLevel" name="Focus Level %" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Log</CardTitle>
              <CardDescription>A detailed log of all your sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Focus Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{formatDate(session.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            session.type === "pomodoro"
                              ? "default"
                              : session.type === "shortBreak"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {session.type === "pomodoro"
                            ? "Focus"
                            : session.type === "shortBreak"
                              ? "Short Break"
                              : "Long Break"}
                        </Badge>
                      </TableCell>
                      <TableCell>{session.duration} min</TableCell>
                      <TableCell>{session.type === "pomodoro" ? `${session.focusLevel}%` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
