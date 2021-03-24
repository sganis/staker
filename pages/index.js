import Header from '../src/components/Header'
import Body from '../src/components/Body'
import Login from '../src/components/Login'
import Footer from '../src/components/Footer'
import 'bootstrap/dist/css/bootstrap.css';

export default function Index() {
    return ( 
        <div class="container">
            <Header />
            <Body />
            <Footer />
        </div>
    );
}
