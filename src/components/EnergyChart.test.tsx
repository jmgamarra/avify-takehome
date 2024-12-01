import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnergyChart } from "./EnergyChart";

test("error message should appear when fetch fails", async() => {
    jest.spyOn(globalThis,'fetch').mockRejectedValue(new Error('Fetch failed')); 
    render(<EnergyChart />);
    await waitFor(() => {
    const message = screen.getByText(/Unable to load data. Try again later/i);
    expect(message).toBeInTheDocument();
    });

    jest.restoreAllMocks();
});

test('loading message should appear', () => {
    render(<EnergyChart />);
    const loadingMessage = screen.getByText(/Loading.../i);
    expect(loadingMessage).toBeInTheDocument();
  });

test('fetch succesful invoque',async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          data: {
            generationmix: [
              { fuel: 'Wind', perc: 30 },
              { fuel: 'Solar', perc: 20 },
            ],
            from: '2023-01-01T00:00:00Z',
            to: '2023-01-01T00:30:00Z',
          },
        }),
      } as Response);
    render(<EnergyChart />);

    await waitFor(()=>{
        expect(screen.getByText(/Wind/i)).toBeInTheDocument();
        expect(screen.getByText(/Solar/i)).toBeInTheDocument();
    });

   jest.resetAllMocks();     
});

jest.mock("./EnergyChart", () => {
    const originalModule = jest.requireActual("./EnergyChart");
    return {
      ...originalModule,
      formatDateTime: jest.fn(),
    };
  });

  