import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './index.css';

const api = {
    baseUrl: `https://api.flickr.com/services/rest/?method=flickr.interestingness.getList&`,
    extras: `url_n,owner_name,views`,
    key:`7d9089bab5d9509e10414f271835bdff`
};

class Gallery extends React.Component {

    constructor(props) {
        super(props);
        this.state = {pics: [], requestSent: false, page: 1, maxpage:0};
    }

    componentDidMount() {
        window.addEventListener('scroll',this.handleOnScroll);
        axios.get(api.baseUrl + `api_key=` + api.key + `&extras=` + api.extras
            + `&per_page=20&page=` + this.state.page + `&format=json&nojsoncallback=1`)
            .then(res => {
                let data = res.data.photos.photo;
                let maxpg = res.data.photos["pages"];
                this.setState({pics: data,maxpage: maxpg});
            });
        this.setState({page: 2});
    }

    componentWillUnmount() {
        window.removeEventListener('scroll',this.handleOnScroll);
    }

    doQuery = () => {
        if (this.state.page > this.state.maxpage)
            return;
        axios.get(api.baseUrl + `api_key=` + api.key + `&extras=` + api.extras
            + `&per_page=20&page=` + this.state.page + `&format=json&nojsoncallback=1`)
            .then(res => {
                let data = this.state.pics.concat(res.data.photos.photo);
                this.setState({pics: data});
            });
        let pg = this.state.page + 1;
        this.setState({page: pg, requestSent: false});
    }

    handleOnScroll= () => {
        // http://stackoverflow.com/questions/9439725/javascript-how-to-detect-if-browser-window-is-scrolled-to-bottom
        let scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
        let scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
        let clientHeight = document.documentElement.clientHeight || window.innerHeight;
        let scrolledToBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

        if (scrolledToBottom) {
            if (this.state.requestSent) {
                return;
            }
            // enumerate a slow query
            setTimeout(this.doQuery, 1000);
            this.setState({requestSent: true});
        }
    }

    render() {
        return (
            <div>
                <ListImg data={this.state.pics}/>
                {
                    (()=> {
                    if (this.state.requestSent) {
                        return (
                            <div className="loading">Loading&#8230;</div>
                        );
                    }
                    })()
                }
            </div>
        );
    }
}

class ListImg extends React.Component {
    render() {
        return (
            <div className="listImg">
                {this.props.data.map(data => {
                    return (<SingleImg data={data} key={data.id}/>);
                })}
            </div>
        );
    }
}

class SingleImg extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mouseOver: false
        };
    }

    // Event handlers to modify state values
    _mouseEnter=(e)=> {
        e.preventDefault();
        if (this.state.mouseOver === false) {
            this.setState({
                mouseOver: true
            })
        }
    }

    _mouseLeave=(e)=> {
        e.preventDefault();
        if (this.state.mouseOver === true) {
            this.setState({
                mouseOver: false
            })
        }
    }

    render() {
        return (
            <div className="singleImg">
                <img
                    onMouseEnter={(e)=>this._mouseEnter(e)}
                    onMouseLeave={(e)=>this._mouseLeave(e)}
                    src={this.props.data.url_n}
                    alt={this.props.data.id}
                />
                <div className="img__description">
                    <p> Title: {this.props.data.title}</p>
                    <p> Owner: {this.props.data.ownername}</p>
                    <p> Views: {this.props.data.views}</p>
                </div>
            </div>
        );
    }
}


ReactDOM.render(<Gallery/>, document.getElementById("root"));