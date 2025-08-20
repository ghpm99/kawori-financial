import { createContext, useContext, useReducer, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllContractService } from '@/services/financial';
('@tanstack/react-query');

interface IModalContracts {
    newPayment: {
        visible: boolean;
        error: boolean;
        errorMsg: string;
    };
}

type PayloadChangeVisibleModalContractsAction = {
    modal: keyof IModalContracts;
    visible: boolean;
};

interface IContract {
    id: number;
    name: string;
    value: number;
    value_open: number;
    value_closed: number;
}

type PayloadSetFilterContractsAction = {
    name: string;
    value: any;
};

interface IContractFilters {
    page: number;
    page_size: number;
    id?: number;
}

interface ContractContextProps {
    data: IContract[];
    loading: boolean;
    modal: IModalContracts;
    pagination: {
        currentPage: number;
        hasNext: boolean;
        hasPrevious: boolean;
        totalPages: number;
    };
    filters: IContractFilters;
    dispatchFilters: React.Dispatch<FiltersAction>;
}

interface IContractPagination {
    data: IContract[];
    current_page: number;
    has_next: boolean;
    has_previous: boolean;
    total_pages: number;
}

type FiltersAction =
    | { type: 'SET_FILTER'; name: keyof IContractFilters; value: any }
    | { type: 'RESET_FILTERS' }
    | { type: 'SET_PAGE'; page: number }
    | { type: 'SET_PAGE_SIZE'; size: number };

function filtersReducer(state: IContractFilters, action: FiltersAction): IContractFilters {
    switch (action.type) {
        case 'SET_FILTER':
            return { ...state, [action.name]: action.value, page: 1 }; // reset page ao filtrar
        case 'SET_PAGE':
            return { ...state, page: action.page };
        case 'SET_PAGE_SIZE':
            return { ...state, page_size: action.size, page: 1 };
        case 'RESET_FILTERS':
            return { page: 1, page_size: 10 };
        default:
            return state;
    }
}

const ContractContext = createContext<ContractContextProps | undefined>(undefined);

export const ContractProvider = ({ children }: { children: ReactNode }) => {
    const [filters, dispatch] = useReducer(filtersReducer, { page: 1, page_size: 10 });

    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const { data, isLoading } = useQuery<IContractPagination>({
        queryKey: ['contracts', filters],
        queryFn: () => fetchAllContractService({ page: 1, page_size: 10 }),
        refetchOnWindowFocus: false,
    });

    return (
        <ContractContext.Provider
            value={{
                data: data?.data || [],
                loading: isLoading,
                pagination: {
                    currentPage: data?.current_page || 1,
                    hasNext: data?.has_next || false,
                    hasPrevious: data?.has_previous || false,
                    totalPages: data?.total_pages || 1,
                },
                filters: filters,
                dispatchFilters: dispatch,
                modal: {
                    newPayment: {
                        visible: modalVisible,
                        error: false,
                        errorMsg: '',
                    },
                },
            }}
        >
            {children}
        </ContractContext.Provider>
    );
};

export const useContract = () => {
    const context = useContext(ContractContext);
    if (!context) {
        throw new Error('useLayout deve ser usado dentro de LayoutProvider');
    }
    return context;
};
