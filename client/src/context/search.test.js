import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { SearchProvider, useSearch } from './search';

// NOTE: The test setup was written with the help of an LLM

const TestComponent = () => {
    const [values, setValues] = useSearch();

    return (
        <div>
            <div data-testid="keyword">{values.keyword}</div>
            <div data-testid="results">{JSON.stringify(values.results)}</div>
            <button
                onClick={() =>
                    setValues({ keyword: 'laptop', results: [{ id: 1, name: 'Laptop' }] })
                }
            >
                Update
            </button>
        </div>
    );
};

describe('Search Context Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Provider Structure', () => {
        // NOTE: The test below was written with the help of an LLM
        test('renders children inside provider', () => {
            render(
                <SearchProvider>
                    <div data-testid="child">Hello</div>
                </SearchProvider>
            );
            expect(screen.getByTestId('child')).toHaveTextContent('Hello');
        });
    });

    describe('Default State', () => {
        // NOTE: The test below was written with the help of an LLM
        test('provides default keyword and results', () => {
            render(
                <SearchProvider>
                    <TestComponent />
                </SearchProvider>
            );

            expect(screen.getByTestId('keyword')).toHaveTextContent('');
            expect(screen.getByTestId('results')).toHaveTextContent('[]');
        });
    });

    describe('State Updates', () => {
        // NOTE: The test below was written with the help of an LLM
        test('updates keyword and results when setValues is called', () => {
            render(
                <SearchProvider>
                    <TestComponent />
                </SearchProvider>
            );

            const button = screen.getByRole('button', { name: /update/i });

            act(() => {
                button.click();
            });

            expect(screen.getByTestId('keyword')).toHaveTextContent('laptop');
            expect(screen.getByTestId('results')).toHaveTextContent(
                JSON.stringify([{ id: 1, name: 'Laptop' }])
            );
        });
        // NOTE: The test below was written with the help of an LLM
        test('can reset state back to empty values', () => {
            const ResetTestComponent = () => {
                const [values, setValues] = useSearch();

                return (
                    <div>
                        <div data-testid="keyword">{values.keyword}</div>
                        <div data-testid="results">{JSON.stringify(values.results)}</div>
                        <button
                            data-testid="update"
                            onClick={() =>
                                setValues({ keyword: 'laptop', results: [{ id: 1, name: 'Laptop' }] })
                            }
                        >
                            Update
                        </button>
                        <button
                            data-testid="reset"
                            onClick={() => setValues({ keyword: '', results: [] })}
                        >
                            Reset
                        </button>
                    </div>
                );
            };

            render(
                <SearchProvider>
                    <ResetTestComponent />
                </SearchProvider>
            );

            const updateButton = screen.getByTestId('update');
            const resetButton = screen.getByTestId('reset');

            // First update
            act(() => {
                updateButton.click();
            });

            // Verify update worked
            expect(screen.getByTestId('keyword')).toHaveTextContent('laptop');

            // Then reset
            act(() => {
                resetButton.click();
            });

            // Verify reset
            expect(screen.getByTestId('keyword')).toHaveTextContent('');
            expect(screen.getByTestId('results')).toHaveTextContent('[]');
        });
    });
    describe('Edge Cases', () => {
        // NOTE: The test below was written with the help of an LLM
        test('handles large results array', () => {
            const bigArray = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));

            const BigTest = () => {
                const [values, setValues] = useSearch();
                React.useEffect(() => {
                    setValues({ keyword: 'bulk', results: bigArray });
                }, []); // Empty array - run once on mount
                return <div data-testid="results">{values.results.length}</div>;
            };

            render(
                <SearchProvider>
                    <BigTest />
                </SearchProvider>
            );

            expect(screen.getByTestId('results')).toHaveTextContent('100');
        });
        //// New understanding of need for merging state instead of replacing
        // test('handles large results array', () => {
        //     const bigArray = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));

        //     const BigTest = () => {
        //         const [values, setValues] = useSearch();
        //         React.useEffect(() => {
        //             setValues({ keyword: 'bulk', results: bigArray });
        //         }, [setValues]);
        //         return <div data-testid="results">{values.results.length}</div>;
        //     };

        //     render(
        //         <SearchProvider>
        //             <BigTest />
        //         </SearchProvider>
        //     );

        //     expect(screen.getByTestId('results')).toHaveTextContent('100');
        // });
        // NOTE: The test below was written with the help of an LLM
        test('throws error if useSearch is used outside provider', () => {
            const BrokenComponent = () => {
                useSearch();
                return <div>Broken</div>;
            };

            // Suppress React error boundary logs
            const spy = jest.spyOn(console, 'error').mockImplementation(() => { });

            expect(() => render(<BrokenComponent />)).toThrow();

            spy.mockRestore();
        });
        // NOTE: The test below was written with the help of an LLM
        //// New understanding of need for merging state instead of replacing
        // test('replaces entire state object on update (no merge)', () => {
        //     const PartialUpdate = () => {
        //         const [values, setValues] = useSearch();
        //         React.useEffect(() => {
        //             setValues({ keyword: 'onlyKeyword' }); // no results provided
        //         }, [setValues]);
        //         return (
        //             <div data-testid="results">{JSON.stringify(values.results)}</div>
        //         );
        //     };

        //     render(
        //         <SearchProvider>
        //             <PartialUpdate />
        //         </SearchProvider>
        //     );

        //     // Results should be undefined, not preserved
        //     expect(screen.getByTestId('results')).toHaveTextContent('');
        // });

        // NOTE: The test below was written with the help of an LLM
        test('nested providers isolate state', () => {
            const InnerComponent = () => {
                const [values, setValues] = useSearch();
                React.useEffect(() => {
                    setValues({ keyword: 'inner', results: [] });
                }, []); // Empty array
                return <div data-testid="inner">{values.keyword}</div>;
            };

            const OuterComponent = () => {
                const [values, setValues] = useSearch();
                React.useEffect(() => {
                    setValues({ keyword: 'outer', results: [] });
                }, []); // Empty array
                return (
                    <div>
                        <div data-testid="outer">{values.keyword}</div>
                        <SearchProvider>
                            <InnerComponent />
                        </SearchProvider>
                    </div>
                );
            };

            render(
                <SearchProvider>
                    <OuterComponent />
                </SearchProvider>
            );

            expect(screen.getByTestId('outer')).toHaveTextContent('outer');
            expect(screen.getByTestId('inner')).toHaveTextContent('inner');
        });
        //// New understanding of need for merging state instead of replacing
        // test('nested providers isolate state', () => {
        //     const InnerComponent = () => {
        //         const [values, setValues] = useSearch();
        //         React.useEffect(() => {
        //             setValues({ keyword: 'inner', results: [] });
        //         }, [setValues]);
        //         return <div data-testid="inner">{values.keyword}</div>;
        //     };

        //     const OuterComponent = () => {
        //         const [values, setValues] = useSearch();
        //         React.useEffect(() => {
        //             setValues({ keyword: 'outer', results: [] });
        //         }, [setValues]);
        //         return (
        //             <div>
        //                 <div data-testid="outer">{values.keyword}</div>
        //                 <SearchProvider>
        //                     <InnerComponent />
        //                 </SearchProvider>
        //             </div>
        //         );
        //     };

        //     render(
        //         <SearchProvider>
        //             <OuterComponent />
        //         </SearchProvider>
        //     );

        //     expect(screen.getByTestId('outer')).toHaveTextContent('outer');
        //     expect(screen.getByTestId('inner')).toHaveTextContent('inner');
        // });

        // NOTE: The test below was written with the help of an LLM
        test('handles async updates to state', async () => {
            const AsyncComponent = () => {
                const [values, setValues] = useSearch();
                React.useEffect(() => {
                    setTimeout(() => {
                        setValues({ keyword: 'async', results: [{ id: 1, name: 'Async Item' }] });
                    }, 50);
                }, []); // Empty array
                return <div data-testid="keyword">{values.keyword}</div>;
            };

            render(
                <SearchProvider>
                    <AsyncComponent />
                </SearchProvider>
            );

            // Initially empty
            expect(screen.getByTestId('keyword')).toHaveTextContent('');

            // After async update
            await screen.findByText('async');
        });
        //// New understanding of need for merging state instead of replacing
        // test('handles async updates to state', async () => {
        //     const AsyncComponent = () => {
        //         const [values, setValues] = useSearch();
        //         React.useEffect(() => {
        //             setTimeout(() => {
        //                 setValues({ keyword: 'async', results: [{ id: 1, name: 'Async Item' }] });
        //             }, 50);
        //         }, [setValues]);
        //         return <div data-testid="keyword">{values.keyword}</div>;
        //     };

        //     render(
        //         <SearchProvider>
        //             <AsyncComponent />
        //         </SearchProvider>
        //     );

        //     // Initially empty
        //     expect(screen.getByTestId('keyword')).toHaveTextContent('');

        //     // After async update
        //     await screen.findByText('async');
        // });

        // NOTE: The test below was written with the help of an LLM
        test('accepts unexpected data shapes without crashing', () => {
            const WeirdComponent = () => {
                const [values, setValues] = useSearch();
                React.useEffect(() => {
                    setValues({ keyword: 12345, results: 'not-an-array' });
                }, []); // Empty array
                return (
                    <>
                        <div data-testid="keyword">{String(values.keyword)}</div>
                        <div data-testid="results">{String(values.results)}</div>
                    </>
                );
            };

            render(
                <SearchProvider>
                    <WeirdComponent />
                </SearchProvider>
            );

            expect(screen.getByTestId('keyword')).toHaveTextContent('12345');
            expect(screen.getByTestId('results')).toHaveTextContent('not-an-array');
        });
        //// New understanding of need for merging state instead of replacing
        // test('accepts unexpected data shapes without crashing', () => {
        //     const WeirdComponent = () => {
        //         const [values, setValues] = useSearch();
        //         React.useEffect(() => {
        //             setValues({ keyword: 12345, results: 'not-an-array' });
        //         }, [setValues]);
        //         return (
        //             <>
        //                 <div data-testid="keyword">{String(values.keyword)}</div>
        //                 <div data-testid="results">{String(values.results)}</div>
        //             </>
        //         );
        //     };

        //     render(
        //         <SearchProvider>
        //             <WeirdComponent />
        //         </SearchProvider>
        //     );

        //     expect(screen.getByTestId('keyword')).toHaveTextContent('12345');
        //     expect(screen.getByTestId('results')).toHaveTextContent('not-an-array');
        // });


        // NOTE: The test below was written with the help of an LLM
        test('multiple components share the same state', () => {
            // Component A only reads the state
            const ComponentA = () => {
                const [values] = useSearch();
                return <div data-testid="comp-a">{values.keyword}</div>;
            };

            // Component B reads and updates the state
            const ComponentB = () => {
                const [values, setValues] = useSearch();
                return (
                    <div>
                        <div data-testid="comp-b">{values.keyword}</div>
                        <button onClick={() => setValues({ keyword: 'shared' })}>
                            Update
                        </button>
                    </div>
                );
            };

            render(
                <SearchProvider>
                    <ComponentA />
                    <ComponentB />
                </SearchProvider>
            );

            // Initially both should show empty string
            expect(screen.getByTestId('comp-a')).toHaveTextContent('');
            expect(screen.getByTestId('comp-b')).toHaveTextContent('');

            // Click button in Component B
            const button = screen.getByRole('button', { name: /update/i });
            act(() => {
                button.click();
            });

            // Both components should now show the updated value
            expect(screen.getByTestId('comp-a')).toHaveTextContent('shared');
            expect(screen.getByTestId('comp-b')).toHaveTextContent('shared');
        });

        // NOTE: The test below was written with the help of an LLM
        test('state merging preserves other properties', () => {
            const MergeTestComponent = () => {
                const [values, setValues] = useSearch();

                return (
                    <div>
                        <div data-testid="keyword">{values.keyword}</div>
                        <div data-testid="results">{JSON.stringify(values.results)}</div>
                        <button
                            data-testid="set-keyword"
                            onClick={() => setValues({ keyword: 'laptop' })}
                        >
                            Set Keyword Only
                        </button>
                        <button
                            data-testid="set-results"
                            onClick={() => setValues({ results: [{ id: 1, name: 'Item' }] })}
                        >
                            Set Results Only
                        </button>
                    </div>
                );
            };

            render(
                <SearchProvider>
                    <MergeTestComponent />
                </SearchProvider>
            );

            // Set keyword first
            act(() => {
                screen.getByTestId('set-keyword').click();
            });

            expect(screen.getByTestId('keyword')).toHaveTextContent('laptop');
            expect(screen.getByTestId('results')).toHaveTextContent('[]');

            // Now set results - keyword should still be there!
            act(() => {
                screen.getByTestId('set-results').click();
            });

            expect(screen.getByTestId('keyword')).toHaveTextContent('laptop');
            expect(screen.getByTestId('results')).toHaveTextContent(
                JSON.stringify([{ id: 1, name: 'Item' }])
            );
        });
    });
});