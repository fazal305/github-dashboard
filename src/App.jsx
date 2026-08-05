import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SearchProvider } from './context/SearchContext.jsx';
import AppRouter from './router/AppRouter.jsx';

function App() {
  return (
    <ThemeProvider>
      <SearchProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AppRouter />
        </BrowserRouter>
      </SearchProvider>
    </ThemeProvider>
  );
}

export default App;
