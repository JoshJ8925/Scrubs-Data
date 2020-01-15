import React from 'react';
import * as faqService from '../../services/faqService';
import logger from 'sabio-debug';
import './FAQs.css';
import FAQAccordion from './FAQAccordion';
import { Link } from 'react-router-dom';

const _logger = logger.extend('FAQs');

class FAQs extends React.Component {
    state = {
        faqs: [],
        filteredFaqs: [],
        activeFAQId: null
    };

    componentDidMount() {
        this.getAll();
    }

    getAll = () => {
        faqService.getAll().then(this.allFaqsSuccess).catch(this.allFaqsError);
    };

    allFaqsSuccess = (response) => {
        _logger(response);

        let filteredFaqs = response.items.filter((faq) => {
            return faq.categoryId === 1;
        });
        return this.setState({ faqs: response.items, filteredFaqs });
    };

    allFaqsError = (responseError) => {
        _logger(responseError);
    };

    catClickHandler = (e) => {
        const { id } = e.target;
        const catDict = { SITE: 1, PROVIDERS: 2, PRACTICES: 3, INSURANCE: 4 };
        let filteredFaqs = this.state.faqs.filter((faq) => {
            return faq.categoryId === catDict[id];
        });

        this.setState({ filteredFaqs });
        this.makeActive(catDict[id]);
    };

    makeActive = (activeFAQId) => {
        this.setState({ activeFAQId });
    };

    mapCategoryHeaders = () => {
        const headers = ['SITE', 'PROVIDERS', 'PRACTICES', 'INSURANCE'];
        const defaultStyle = {
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            visibility: 'hidden',
            zIndex: -1
        };
        return headers.map((item, i) => {
            return (
                <div key={`header-${i}`} header={i} className="col-2 cardMargin cursor">
                    <div className="btnColor text-white card card-hover ">
                        <div className="card-body card-title" id={item} onClick={this.catClickHandler}>
                            {item}
                            <div className="d-flex align-items-center mt-2">
                                <div>
                                    <div className="chartjs-size-monitor" style={defaultStyle}>
                                        <div className="chartjs-size-monitor-expand" style={defaultStyle}>
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    width: '1e+06px',
                                                    height: '1e+06px',
                                                    left: 0,
                                                    top: 0
                                                }}
                                            />
                                        </div>
                                        <div className="chartjs-size-monitor-shrink" style={defaultStyle}>
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    width: '200%',
                                                    height: '200%',
                                                    left: 0,
                                                    top: 0
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <canvas
                                        height={125}
                                        width={125}
                                        className="chartjs-render-monitor"
                                        style={{ display: 'block', height: 0, width: 100 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
    };

    renderQuestions = () => {
        return this.state.filteredFaqs.map((faq) => (
            <FAQAccordion
                key={`faq-${faq.id}`}
                makeActive={this.makeActive}
                activeFAQId={this.state.activeFAQId}
                faq={faq}
            />
        ));
    };

    render() {
        return (
            <React.Fragment>
                <header className="topheader">
                    <h1 className="h1 headerh1 ">Frequently Asked Questions</h1>
                </header>
                <div className=" row scrubCard scrubMargin">{this.mapCategoryHeaders()}</div>
                <div className="faqlist">{this.state.filteredFaqs && this.renderQuestions()}</div>

                <div className="col-sm-6 ">
                    <Link to="/contactus">
                        <button className="btn btnContactUs">Contact Us</button>
                    </Link>
                </div>
            </React.Fragment>
        );
    }
}
export default FAQs;
