import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProfileProvider from './components/ProfileProvider'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Photos from './pages/Photos'
import Projects from './pages/Projects'
import ResumePage from './pages/ResumePage'

export default function App() {
  return (
    <BrowserRouter>
      {/* Above the router: the profile drives the nav and footer, which are
          part of the shell rather than any one route. */}
      <ProfileProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="projects" element={<Projects />} />
            <Route path="photos" element={<Photos />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ProfileProvider>
    </BrowserRouter>
  )
}
