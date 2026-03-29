import { HashRouter, Routes, Route } from 'react-router-dom'
import { GroupList } from './features/groups/GroupList'
import { GroupDetail } from './features/groups/GroupDetail'
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt'
import { Footer } from './components/Footer'

function App() {
  return (
    <HashRouter>
      <div className="flex min-h-screen flex-col">
        <Routes>
          <Route path="/" element={<GroupList />} />
          <Route path="/group/:groupId" element={<GroupDetail />} />
        </Routes>
        <Footer />
      </div>
      <PWAUpdatePrompt />
    </HashRouter>
  )
}

export default App
